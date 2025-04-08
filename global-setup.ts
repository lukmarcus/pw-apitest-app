import { expect, request } from "playwright/test";
import user from "./.auth/user.json";
import fs from "fs";

async function globalSetup() {
  const authFile = ".auth/user.json";
  const context = await request.newContext();

  const responseToken = await context.post(
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
  const responseTokenJson = await responseToken.json();
  const accessToken = responseTokenJson.user.token;
  user.origins[0].localStorage[0].value = accessToken;
  fs.writeFileSync(authFile, JSON.stringify(user));

  process.env["ACCESS_TOKEN"] = accessToken;

  const articleResponse = await context.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Global Likes test article",
          description: "Test Description",
          body: "Test Body",
          tagList: ["test"],
        },
      },
      headers: {
        Authorization: `Token ${process.env["ACCESS_TOKEN"]}`,
      },
    }
  );

  expect(articleResponse.status()).toEqual(201);

  const articleResponseJson = await articleResponse.json();
  const slugId = articleResponseJson.article.slug;
  process.env["SLUGID"] = slugId;
}

export default globalSetup;
