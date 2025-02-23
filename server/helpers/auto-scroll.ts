import type { Page } from "puppeteer";

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    const wrapper = document.querySelector('div[role="feed"]');

    await new Promise<void>((resolve) => {
      var totalHeight = 0;
      var distance = 1000;
      var scrollDelay = 3000;

      var timer = setInterval(async () => {
        if (!wrapper) return;
        var scrollHeightBefore = wrapper.scrollHeight;
        wrapper.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeightBefore) {
          totalHeight = 0;
          await new Promise((resolve) => setTimeout(resolve, scrollDelay));

          var scrollHeightAfter = wrapper.scrollHeight;

          if (scrollHeightAfter > scrollHeightBefore) {
            return;
          } else {
            clearInterval(timer);
            resolve();
          }
        }
      }, 200);
    });
  })
};