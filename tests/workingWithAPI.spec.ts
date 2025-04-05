import { test, expect } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
});

test("api response mock", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a MOCK test title";
    responseBody.articles[0].description = "This is a MOCK test description";

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText("Global Feed").click();
  await page.waitForTimeout(2000);
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toHaveText(
    "This is a MOCK test title"
  );
  await expect(page.locator("app-article-list p").first()).toHaveText(
    "This is a MOCK test description"
  );
});

test("delete article", async ({ page, request }) => {
  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "lukmarcus@test.com",
          password: "Test1234!",
        },
      },
    }
  );
  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Test Article",
          description: "Test Description",
          body: "Test Body",
          tagList: ["test"],
        },
      },
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  );

  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("Test Article").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();

  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "Test Article"
  );
});

test("create article", async ({ page, request }) => {
  await page.getByText("New Article").click();
  await page
    .getByRole("textbox", { name: "Article Title" })
    .fill("Playwright is awesome");
  await page
    .getByRole("textbox", { name: "What's this article about?" })
    .fill("About the Playwright");
  await page
    .getByRole("textbox", { name: "Write your article (in markdown)" })
    .fill(
      "Playwright is a Node.js library to automate Chromium, Firefox, and WebKit with a single API."
    );
  await page.getByRole("button", { name: "Publish Article" }).click();

  const articleResponse = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );
  const articleResponseBody = await articleResponse.json();
  const articleSlug = articleResponseBody.article.slug;

  await expect(page.locator(".article-page h1")).toHaveText(
    "Playwright is awesome"
  );

  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();

  await expect(page.locator("app-article-list h1").first()).toHaveText(
    "Playwright is awesome"
  );

  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "lukmarcus@test.com",
          password: "Test1234!",
        },
      },
    }
  );
  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`,
    {
      headers: {
        Authorization: `Token ${accessToken}`,
      },
    }
  );

  expect(deleteArticleResponse.status()).toEqual(204);

  await page.getByText("Global Feed").click();
  await expect(page.locator("app-article-list h1").first()).not.toContainText(
    "Playwright is awesome"
  );
});
