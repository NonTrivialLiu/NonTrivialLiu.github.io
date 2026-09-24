const { test, expect } = require("@playwright/test");

for (const [path, name, section, modules] of [
  ["/al-folio/", "Feifan Liu", "From Edge Hardware to Complex Systems", ["news", "latest posts", "selected publications"]],
  ["/al-folio/zh-cn/", "刘非凡", "从硬件端侧到复杂系统", ["动态", "最新文章", "代表论文"]],
]) {
  test(`homepage layout: ${name}`, async ({ page }, testInfo) => {
    await page.goto(path);

    await expect(page.locator("h1.post-title")).toHaveText(name);
    await expect(page.locator(".profile img")).toHaveCount(1);
    await expect(page.locator(".profile img")).toHaveAttribute("alt", name);
    if (testInfo.project.name === "mobile") {
      const imageWidth = await page.locator(".profile img").evaluate((image) => image.getBoundingClientRect().width);
      expect(imageWidth).toBeLessThanOrEqual(260);
    }
    await expect(page.locator(".post > article > h2")).toHaveText(modules);
    await expect(page.locator("#liu2025edge")).toBeVisible();
    await expect(page.locator(".social .contact-icons")).toBeVisible();
    await expect(page.locator(".homepage-bio code")).toHaveCount(4);
    await expect(page.locator(".homepage-bio a")).toHaveAttribute("href", `${path}blog/`);

    const heading = page.locator(".homepage-bio p > strong:first-child").filter({ hasText: section });
    await expect(heading).toHaveCSS("display", "block");
  });
}
