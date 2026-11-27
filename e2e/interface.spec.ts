import { expect, test } from "@playwright/test";

const settingsTrigger =
  '.header .setting-icon-container:has([data-tooltip-content="Settings"])';

test.beforeEach(async ({ context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  await context.route(/^https?:\/\//, (route) =>
    new URL(route.request().url()).origin === origin
      ? route.continue()
      : route.abort()
  );
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
]) {
  test.describe(`phone at ${viewport.width}px`, () => {
    test.use({ viewport, isMobile: true, hasTouch: true });

    test("dismisses the first-run storage prompt and opens settings", async ({
      page,
    }) => {
      await page.goto("/");
      const prompt = page.locator(".local-file-dialog");
      await expect(prompt).toBeInViewport({ ratio: 0.98 });
      await prompt
        .getByRole("button", { name: "Continue to store in the browser" })
        .tap();
      await expect(prompt).toBeHidden();

      await page.locator(settingsTrigger).tap();
      const settings = page.getByRole("dialog", { name: "Settings" });
      await expect(settings).toBeInViewport({ ratio: 0.98 });
      const category = settings.getByRole("combobox", { name: "Settings" });
      await category.selectOption("appearance");
      await expect(category).toHaveValue("appearance");
      await expect(settings.locator(".setting-dialog-info")).toBeVisible();
      await settings.getByRole("button", { name: "Close", exact: true }).tap();
      await expect(settings).toBeHidden();
    });

    test("reaches manual login and keeps the inputs on screen", async ({
      page,
    }) => {
      await page.goto("/#/login");
      await page.getByText("Next step", { exact: true }).tap();
      await page.getByText("Next step", { exact: true }).tap();
      await page.getByText("Continue with Email", { exact: true }).tap();
      const email = page.locator('input[name="email"]');
      const code = page.getByPlaceholder("Enter code", { exact: true });
      await email.scrollIntoViewIfNeeded();
      await expect(email).toBeInViewport({ ratio: 0.98 });
      await email.fill("reader@example.com");
      await code.scrollIntoViewIfNeeded();
      await expect(code).toBeInViewport({ ratio: 0.98 });
      await code.fill("123456");
      await expect(code).toHaveValue("123456");
    });
  });
}

test("opens the desktop settings categories", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue to store in the browser" })
    .click();
  await page.locator(settingsTrigger).click();
  const settings = page.getByRole("dialog", { name: "Settings" });
  await expect(settings).toBeInViewport({ ratio: 0.98 });
  await settings.locator(".setting-dialog-sidebar-item").getByText("Appearance").click();
  await expect(settings.locator(".setting-dialog-main-header")).toHaveText("Appearance");
  await settings.getByRole("button", { name: "Close", exact: true }).click();
  await expect(settings).toBeHidden();
});

test.describe("Vietnamese dark theme", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    locale: "vi-VN",
    colorScheme: "dark",
    isMobile: true,
    hasTouch: true,
  });

  test("opens and closes settings with localized controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page
      .getByRole("button", { name: "Tiếp tục lưu trữ trong trình duyệt" })
      .tap();
    await page
      .locator('.header .setting-icon-container:has([data-tooltip-content="Cài đặt"])')
      .tap();
    const settings = page.getByRole("dialog", { name: "Cài đặt" });
    await expect(settings).toBeInViewport({ ratio: 0.98 });
    const category = settings.getByRole("combobox", { name: "Cài đặt" });
    await category.selectOption({ label: "Hình dạng" });
    await expect(category).toHaveValue("appearance");
    await settings.getByRole("button", { name: "Đóng", exact: true }).tap();
    await expect(settings).toBeHidden();
  });
});

for (const path of ["invalid", "manager/invalid"]) {
  test(`returns to the library from /${path}`, async ({ page }) => {
    await page.goto("/#/" + path);
    const storage = page.getByRole("button", {
      name: "Continue to store in the browser",
    });
    if (path.startsWith("manager/")) {
      await storage.click();
    }
    await expect(
      page.getByRole("heading", { name: "It seems like you're lost" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Return to homepage" }).click();
    await expect(page).toHaveURL(/#\/manager\/(home|empty)$/);
  });
}

test("preserves the authorization callback at the root URL", async ({ page }) => {
  await page.goto("/?error=access_denied");
  await expect(page.getByText("Authorisation failed", { exact: true })).toBeVisible();
});

test.describe("Android preview", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("navigates using tabs, the drawer, and search", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Continue to store in the browser" })
      .tap();
    await page.goto("/?androidShell=1");

    const appBar = page.locator(".m3-app-bar");
    const nav = page.locator(".m3-bottom-nav");
    await expect(appBar).toBeInViewport({ ratio: 0.98 });
    await expect(nav).toBeInViewport({ ratio: 0.98 });
    await nav.getByRole("button", { name: "Notes", exact: true }).tap();
    await expect(page).toHaveURL(/#\/manager\/note$/);

    const menu = appBar.getByRole("button", { name: "Menu", exact: true });
    const drawer = page.locator("#android-drawer");
    await menu.tap();
    await expect(drawer).toBeVisible();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    await appBar.getByRole("button", { name: "Search", exact: true }).tap();
    const search = appBar.getByPlaceholder("Search my notes");
    await expect(search).toBeFocused();
    await search.fill("Sample");
    await page.keyboard.press("Escape");
    await expect(search).toBeHidden();

    await appBar.getByRole("button", { name: "Settings", exact: true }).tap();
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeInViewport({ ratio: 0.98 });
    await page.keyboard.press("Escape");
    await expect(settings).toBeHidden();
  });
});

test("imports, searches for, and opens a local TXT book", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue to store in the browser" })
    .click();
  const sampleText = "A sample line in the local e-book.";
  await page.locator("#import-book-box").setInputFiles({
    name: "Sample book.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(("Chapter 1\n" + sampleText + "\n").repeat(12)),
  });
  const book = page.locator(".book-list-item").filter({ hasText: "Sample book" });
  await expect(book).toHaveCount(1);
  const search = page.locator(".header-search-box");
  await search.fill("Sample book");
  await search.press("Enter");
  await expect(book).toBeVisible();
  const readerPromise = page.waitForEvent("popup");
  await book.locator(".book-item-cover").click();
  const reader = await readerPromise;
  await expect(reader).toHaveURL(/#\/txt\//);
  await expect(
    reader.frameLocator("iframe").getByText(sampleText, { exact: true }).first()
  ).toBeVisible();
});
