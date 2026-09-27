const { test, expect, devices } = require("@playwright/test");

if (process.env.PLAYWRIGHT_CHANNEL) {
  test.use({ channel: process.env.PLAYWRIGHT_CHANNEL, browserName: "chromium" });
}

const siteOrigin = require("./playwright.config").use.baseURL.replace(/\/$/, "");

function localeContext(browser, locale, storageState) {
  const device = test.info().project.name === "mobile" ? { ...devices["iPhone 12"] } : { viewport: { width: 1366, height: 1800 } };
  delete device.defaultBrowserType;
  return browser.newContext({ ...device, locale, ...(storageState ? { storageState } : {}) });
}

async function switchLanguage(page, name) {
  const link = page.getByRole("link", { name });
  if (!(await link.isVisible())) await page.locator(".navbar-toggler").click();
  await link.click();
}

test("Chinese browser preference opens the Chinese homepage", async ({ browser }) => {
  const context = await localeContext(browser, "zh-TW");
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-cn");
  } finally {
    await context.close();
  }
});

test("homepage language routing preserves query and fragment", async ({ browser }) => {
  const context = await localeContext(browser, "zh-CN");
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/?ref=share#news`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/?ref=share#news`);
  } finally {
    await context.close();
  }
});

test("manual English choice persists over a Chinese browser preference", async ({ browser }) => {
  const context = await localeContext(browser, "zh-TW");
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);
    await switchLanguage(page, "English");
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const returningPage = await context.newPage();
    await returningPage.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(returningPage).toHaveURL(`${siteOrigin}/`);
  } finally {
    await context.close();
  }
});

test("manual Chinese choice persists across browser sessions", async ({ browser }) => {
  const context = await localeContext(browser, "en-US");
  let returningContext;

  try {
    const page = await context.newPage();
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await switchLanguage(page, "简体中文");
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);

    returningContext = await localeContext(browser, "en-US", await context.storageState());
    const returningPage = await returningContext.newPage();
    await returningPage.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(returningPage).toHaveURL(`${siteOrigin}/zh-cn/`);
  } finally {
    await context.close();
    if (returningContext) await returningContext.close();
  }
});

test("homepage chooses the first supported browser language", async ({ browser }) => {
  const context = await localeContext(browser, "fr-FR");
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", { get: () => ["fr-FR", "zh-Hant", "en-US"] });
  });
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);
  } finally {
    await context.close();
  }
});

test("English stays first when Chinese is a lower browser preference", async ({ browser }) => {
  const context = await localeContext(browser, "en-US");
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "zh-CN"] });
  });
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  } finally {
    await context.close();
  }
});

test("specific page URLs keep their requested language", async ({ browser }) => {
  const context = await localeContext(browser, "zh-CN");
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/blog/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/blog/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto(`${siteOrigin}/zh-cn/blog/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/blog/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-cn");
  } finally {
    await context.close();
  }
});

test("English browser can follow Chinese links and switch back explicitly", async ({ browser }) => {
  const context = await localeContext(browser, "en-US");
  const page = await context.newPage();

  try {
    for (const path of ["zh-cn/", "zh-cn/blog/", "zh-cn/blog/agent-skills/"]) {
      await page.goto(`${siteOrigin}/${path}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(`${siteOrigin}/${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "zh-cn");
    }

    await switchLanguage(page, "English");
    await expect(page).toHaveURL(`${siteOrigin}/blog/agent-skills/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto(`${siteOrigin}/zh-cn/blog/agent-skills/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/blog/agent-skills/`);
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
  } finally {
    await context.close();
  }
});

test("unsupported browser languages use the English homepage", async ({ browser }) => {
  const context = await localeContext(browser, "ja-JP");
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  } finally {
    await context.close();
  }
});

test("language links work when preference storage is unavailable", async ({ browser }) => {
  const context = await localeContext(browser, "zh-CN");
  await context.addInitScript(() => {
    for (const method of ["getItem", "setItem"]) {
      Storage.prototype[method] = function () {
        throw new DOMException("Storage disabled", "SecurityError");
      };
    }
  });
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await switchLanguage(page, "简体中文");
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);
  } finally {
    await context.close();
  }
});

test("manual English choice remains reachable when storage is read-only", async ({ browser }) => {
  const context = await localeContext(browser, "zh-CN");
  await context.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage is read-only", "SecurityError");
    };
  });
  const page = await context.newPage();

  try {
    await page.goto(`${siteOrigin}/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(`${siteOrigin}/`);
    await switchLanguage(page, "简体中文");
    await expect(page).toHaveURL(`${siteOrigin}/zh-cn/`);
    await switchLanguage(page, "English");
    await expect(page).toHaveURL(`${siteOrigin}/`);
  } finally {
    await context.close();
  }
});
