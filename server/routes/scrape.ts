import { Hono } from "hono";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer"
import { autoScroll } from '../helpers/auto-scroll.js';
import type { Result } from '../types/types.js';
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

// @ts-ignore
puppeteerExtra.use(stealthPlugin());

export const scrapeRoute = new Hono()
  .get('/',
    zValidator(
      'query',
      z.object({
        q: z.string(),
      })
    ),
    async (c) => {
      const query = c.req.query("q")

      if (!query) return c.json("No query provided", 400);

      // @ts-ignore
      const browser = await puppeteerExtra.launch({
        headless: false,
        executablePath: "", // your path here
      }) as puppeteer.Browser;

      const page = await browser.newPage();
      try {
        await page.goto(
          `https://www.google.com/maps/search/${query.split(" ").join("+")}`
        );
      } catch (error) {
        console.log("error going to page");
      }

      // Scroll toda la pagina
      // await autoScroll(page);

      const { results, layoutWithoutWebsite } = await page.evaluate(() => {
        const results: Result[] = [];
        let layoutWithoutWebsite = false;

        const elements = document.querySelectorAll('a[href*="/maps/place/"]');

        elements.forEach(el => {
          const parent = el.parentElement;
          if (!parent) return;

          // TODO: Si no funciona, cambiar por la imagen de los que no tienen website
          if (parent.querySelector('button[data-value="Indicaciones"]') === null) {
            layoutWithoutWebsite = true;
          }

          const url = el.getAttribute('href');
          const title = parent.querySelector('div.fontHeadlineSmall')?.textContent;
          const website = parent.querySelector('a[data-value="Sitio web"]')?.getAttribute('href');
          const phone = parent.querySelector("span.UsdlK")?.textContent;
          const stars = parent.querySelector("span.MW4etd[aria-hidden=true]")?.textContent;

          results.push({ url, title, phone, stars, website });
        });

        return { results, layoutWithoutWebsite };
      });


      // En caso de que el layout no tenga el botón de website, se intenta obtener el website de otra forma
      if (layoutWithoutWebsite) {
        console.log("Layout without website");
        for (const result of results) {
          if (!result.url) continue;

          try {
            await page.goto(result.url, { waitUntil: "domcontentloaded" });
            const website = await page.$eval('a[data-tooltip="Abrir el sitio web"]', element => element.href);
            result.website = website;
          } catch (error) {
            console.log(error)
          }

        }
      }

      await browser.close();

      return c.json(results);
    })