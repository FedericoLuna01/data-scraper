import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer"
import { autoScroll } from './helpers/auto-scroll.js';
import { getWebsite } from './helpers/get-website.js';

const app = new Hono()



// @ts-ignore
puppeteerExtra.use(stealthPlugin());

app.get('/', async (c) => {
  return c.text('Hello Hono!')
})

app.get("/scrape", async (c) => {
  const query = "ferreteria rosario"
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

  // await autoScroll(page);

  const aTags = await page.$$('a[href*="/maps/place/"]');

  console.log("Número de enlaces encontrados:", aTags.length);

  // Iterar sobre los elementos encontrados
  for (const aTag of aTags) {
    // Obtener el elemento padre del <a>
    const parent = await aTag.evaluateHandle(el => el.parentElement);

    const data = await (parent as puppeteer.ElementHandle<Element>).evaluate(async el => {
      const url = el.querySelector('a')?.getAttribute('href');
      if (!url) return;

      const title = el.querySelector('div.fontHeadlineSmall')?.textContent;
      const isWebsiteAvailable = el.querySelector("button.g88MCb.S9kvJb")
      let website;

      if (isWebsiteAvailable) {
        website = el.querySelector('a[data-value="Sitio web"]')?.getAttribute('href');
      } else {
        website = await getWebsite(page, url);
      }

      // TODO: Agregar dirección y categoría
      const phone = el.querySelector("span.UsdlK")?.textContent;
      const stars = el.querySelector("span.MW4etd[aria-hidden=true]")?.textContent;

      return {
        url,
        title,
        phone,
        stars,
        website
      }
    })

    console.log(data);

  }

  await browser.close();

  return c.text("Scraped!");
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
