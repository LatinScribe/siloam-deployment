const { generateAudioUrl } = require("../audio-url-generate");

describe("generateAudioUrl", () => {
  it("should generate a valid audio URL", () => {
    const text = "Hello, world!";
    const language = "en";

    const result = generateAudioUrl(text, language);

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("https://");
  });
});