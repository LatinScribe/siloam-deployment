const request = require("supertest");
const { createMocks } = require("node-mocks-http");
const handler = require("./answer-question"); // Using require instead of import

jest.mock("openai", () => ({
    default: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: "Test response for visually impaired users." } }],
                }),
            },
        },
    })),
}));

describe("answer-question API Handler", () => {
    it("should return 405 if method is not POST", async () => {
        const { req, res } = createMocks({ method: "GET" });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
    });

    it("should return 400 if description or question is missing", async () => {
        const { req, res } = createMocks({
            method: "POST",
            body: { description: "" },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(res._getJSONData()).toEqual({ error: "Description and question are required" });
    });

    it("should return a valid response when OpenAI API is successful", async () => {
        const { req, res } = createMocks({
            method: "POST",
            body: { description: "A cat is sitting on a couch.", question: "What is the cat doing?" },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ result: "Test response for visually impaired users." });
    });

    it("should return 500 when OpenAI API fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error logs in test

        const openai = require("openai").default();
        openai.chat.completions.create.mockRejectedValue(new Error("OpenAI Error"));

        const { req, res } = createMocks({
            method: "POST",
            body: { description: "A tree in autumn.", question: "What color are the leaves?" },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(res._getJSONData()).toEqual({ error: "An error occurred while processing the question" });

        jest.restoreAllMocks(); // Clean up mocks
    });
});