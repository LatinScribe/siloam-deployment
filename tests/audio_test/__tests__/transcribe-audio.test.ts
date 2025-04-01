import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../pages/api/audio/transcribe-audio";

function test(description: string, callback: () => Promise<void> | void) {
  Promise.resolve(callback())
    .then(() => console.log(`✔️  ${description}`))
    .catch((error) => {
      console.error(`❌  ${description}`);
      console.error(error);
    });
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

test("should return 400 if text is missing", async () => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "POST", body: { voice: "alloy" } });
  await handler(req, res);
  assert(res._getStatusCode() === 400, "Expected status code 400");
  assert(JSON.parse(res._getData()).error === "Text is required", "Expected 'Text is required' error");
});

test("should return audio response when valid text is provided", async () => {
  const mockAudioBuffer = Buffer.from("fake_audio_data");

  global.fetch = async () =>
    ({
      arrayBuffer: async () => mockAudioBuffer,
    } as Response);

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: { text: "Hello world", voice: "alloy" },
  });

  await handler(req, res);

  assert(res._getStatusCode() === 200, "Expected status code 200");
  assert(res._getHeaders()["content-type"] === "audio/mpeg", "Expected content-type to be 'audio/mpeg'");
});

test("should return 500 if OpenAI API fails", async () => {
  global.fetch = async () => {
    throw new Error("OpenAI error");
  };

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "POST",
    body: { text: "Hello world" },
  });

  await handler(req, res);

  assert(res._getStatusCode() === 500, "Expected status code 500");
  assert(JSON.parse(res._getData()).error === "Error generating speech", "Expected 'Error generating speech' error");
});
