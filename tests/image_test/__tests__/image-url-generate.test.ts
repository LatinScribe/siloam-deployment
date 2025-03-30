const fs = require("fs");
const path = require("path");
const imageUrlGenerateHandler = require("./image-url-generate"); // Use a different variable name for the handler

// Mock fs and path
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));
jest.mock("path", () => ({
  join: jest.fn(),
  extname: jest.fn(),
  basename: jest.fn(),
}));

describe("Image URL Generate API Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 405 if method is not POST", async () => {
    // Create mock req and res
    const req = { method: "GET" };  // Mocking a GET request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });

  it("should return 401 if API key is invalid", async () => {
    const req = {
      method: "POST",
      body: {
        image: "data:image/png;base64,abcd1234",
        image_name: "example.png",
        customAPIKey: "wrong-api-key",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid API Key" });
  });

  it("should return 400 if image is not provided", async () => {
    const req = {
      method: "POST",
      body: { image_name: "example.png", customAPIKey: "valid-api-key" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please provide an image in base 64 format",
    });
  });

  it("should return 400 if image or image_name is not a string", async () => {
    const req = {
      method: "POST",
      body: {
        image: 12345, // Invalid image format
        image_name: "example.png",
        customAPIKey: "valid-api-key",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please provide valid image and image_name as strings",
    });
  });

  it("should return 200 with image URL when image upload is successful", async () => {
    const req = {
      method: "POST",
      body: {
        image: "data:image/png;base64,abcd1234",
        image_name: "example.png",
        customAPIKey: "valid-api-key",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock fs and path behavior
    fs.existsSync.mockReturnValue(false); // Simulate file doesn't exist
    path.join.mockReturnValue("/path/to/uploaded-images/example.png");

    fs.promises.writeFile.mockResolvedValue(undefined); // Simulate successful file write

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      result: { image_url: "/uploaded-images/example.png" },
    });
  });

  it("should return 500 if there's an error while writing the file", async () => {
    const req = {
      method: "POST",
      body: {
        image: "data:image/png;base64,abcd1234",
        image_name: "example.png",
        customAPIKey: "valid-api-key",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock fs and path behavior
    fs.existsSync.mockReturnValue(false); // Simulate file doesn't exist
    path.join.mockReturnValue("/path/to/uploaded-images/example.png");

    fs.promises.writeFile.mockRejectedValue(new Error("Error writing file"));

    await imageUrlGenerateHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error uploading image! Please try again! Error:",
    });
  });
});