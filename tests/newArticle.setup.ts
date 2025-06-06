import { expect, test as setup } from "@playwright/test";

setup("create new article", async ({ request }) => {
  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Likes test article",
          description: "Test Description",
          body: "Test Body",
          tagList: ["test"],
        },
      },
    }
  );

  expect(articleResponse.status()).toEqual(201);

  const articleResponseJson = await articleResponse.json();
  const slugId = articleResponseJson.article.slug;
  process.env["SLUGID"] = slugId;
});
