import { expect, test as setup } from "@playwright/test";

setup("delete article", async ({ request }) => {
  const articleSlug = process.env["SLUGID"];
  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`
  );

  expect(deleteArticleResponse.status()).toEqual(204);
});
