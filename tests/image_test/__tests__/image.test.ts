import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../pages/api/image-process";
import { verifyURL } from "@/utils/verification";

function test(description: string, callback: () => void) {
  try {
    callback();
    console.log(`✔️  ${description}`);
  } catch (error) {
    console.error(`❌  ${description}`);
    console.error(error);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

test("should return 405 for non-POST requests", async () => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "GET" });
  await handler(req, res);
  assert(res._getStatusCode() === 405, "Expected status code 405");
  assert(JSON.parse(res._getData()).error === "Method not allowed", "Expected 'Method not allowed' error");
});

test("should return 400 if imageURL is missing", async () => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "POST", body: {} });
  await handler(req, res);
  assert(res._getStatusCode() === 400, "Expected status code 400");
  assert(JSON.parse(res._getData()).error === "Image URL is required", "Expected 'Image URL is required' error");
});

test("should return 400 if imageURL is invalid", async () => {
  jest.mock("@/utils/verification", () => ({ verifyURL: jest.fn().mockReturnValue(false) }));
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: { imageURL: "invalid-url" },
  });
  await handler(req, res);
  assert(res._getStatusCode() === 400, "Expected status code 400");
  assert(JSON.parse(res._getData()).error === "Invalid URL provided", "Expected 'Invalid URL provided' error");
});

test("should return a response when valid imageURL is provided", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ choices: [{ message: { content: "Image description" } }] }),
  }) as any;

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: { imageURL: "https://example.com/image.jpg", request: "Describe this image" },
  });

  await handler(req, res);
  assert(res._getStatusCode() === 200, "Expected status code 200");
  assert(JSON.parse(res._getData()).response === "Image description", "Expected correct image description");
});

test("should return 500 if OpenAI API fails", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("OpenAI error")) as any;

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: { imageURL: "https://example.com/image.jpg" },
  });

  await handler(req, res);

  assert(res._getStatusCode() === 500, "Expected status code 500");
  assert(
    JSON.parse(res._getData()).error === "An error occurred while requesting OpenAI to process the image",
    "Expected 'An error occurred while requesting OpenAI to process the image' error"
  );
});
