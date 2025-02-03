import puppeteer from "puppeteer";

export async function getWebsite(page: puppeteer.Page, url: string) {
  try {
    console.log(url)
    await page.goto(url);

    // Usar Puppeteer para seleccionar el elemento y obtener el atributo href
    const website = await page.$eval('a[data-tooltip="Abrir el sitio web"]', element => element.href);

    return website;
  } catch (error: any) {
    console.log("error at getWebsite", error.message);
  }
}
