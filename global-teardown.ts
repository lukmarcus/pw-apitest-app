import { expect, request } from "playwright/test";

async function globalTeardown() {
  const context = await request.newContext();
  const articleSlug = process.env["SLUGID"];
  const deleteArticleResponse = await context.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`,
    {
      headers: {
        Authorization: `Token ${process.env["ACCESS_TOKEN"]}`,
      },
    }
  );

  expect(deleteArticleResponse.status()).toEqual(204);
}

export default globalTeardown;
