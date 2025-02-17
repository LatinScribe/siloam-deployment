import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
// import { verifyURL } from "@/utils/verification";

const customApiKey = process.env.CUSTOM_FILE_API_KEY;

// set the maximum size of the request body
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' // Set desired value here
        }
    }
}

/**
 * API handler to process image upload and generate a URL for the uploaded image.
 * 
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
/**
 * API handler for processing image uploads.
 * 
 * This function handles POST requests to upload an image in base64 format,
 * validates the provided API key, and saves the image to the server's file system.
 * 
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The outgoing response object.
 * 
 * @returns {Promise<void>} - A promise that resolves when the request is handled.
 * 
 * @throws {Error} - Throws an error if the request method is not POST, 
 *                   if the API key is invalid, if the image is not provided or not in base64 format,
 *                   or if there is an error writing the file or creating the directory.
 * 
 * @example
 * // Example request body:
 * // {
 * //   "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 * //   "image_name": "example.png",
 * //   "customAPIKey": "your_custom_api_key"
 * // }
 * 
 * @example
 * // Example response:
 * // {
 * //   "result": {
 * //     "image_url": "/uploaded-images/example.png"
 * //   }
 * // }
 * 
 * @remarks
 * - The image must be provided in base64 format (dataURL).
 * - The image_name must be a string.
 * - The customAPIKey must match the predefined API key.
 * - The function ensures that the uploaded image file name is unique by appending a counter if necessary.
 * - The function creates the necessary directories if they do not exist.
 * - The function logs the progress and errors to the console.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("Starting image upload");

    // Extract image, image_name, and customAPIKey from the request body
    const { image, image_name, customAPIKey } = req.body;

    // Validate the custom API key
    if (customAPIKey !== customApiKey) {
        return res.status(401).json({
            error: "Invalid API Key",
        });
    }

    // Ensure an image is provided in base64 format
    if (!image) {
        return res.status(400).json({
            error: "Please provide an image in base 64 format",
        });
    }

    // Validate that image and image_name are strings
    if (typeof image !== 'string' || typeof image_name !== 'string') {
        return res.status(400).json({
            error: "Please provide valid image and image_name as strings",
        });
    }

    try {
        console.log(`Attempting to upload image named: ${image_name}`);

        // Remove the base64 prefix from the image string
        const trimmedString = image.replace(/^data:image\/\w+;base64,/, "");

        // Convert the image from base64 to a Buffer
        const imageBuffer = Buffer.from(trimmedString, "base64");
        let imageFileName = image_name;
        let imagePath = path.join(process.cwd(), "public/uploaded-images", imageFileName);
        let counter = 1;

        // Check if file already exists and modify the name if it does
        while (fs.existsSync(imagePath)) {
            const ext = path.extname(image_name);
            const baseName = path.basename(image_name, ext);
            imageFileName = `${baseName}_${counter}${ext}`;
            imagePath = path.join(process.cwd(), "public/uploaded-images", imageFileName);
            counter++;
        }

        // Ensure the directory exists
        const dir = path.dirname(imagePath);
        let response;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the file to the determined path
            await fs.promises.writeFile(imagePath, imageBuffer);
            response = { image_url: `/uploaded-images/${imageFileName}` };

            console.log("Image uploaded successfully at: ", imagePath);

            // TODO: Implement the verifyURL function to verify the URL
            // if (!verifyURL(imageURL)) {
            //     return res.status(400).json({
            //         error: "Invalid URL provided",
            //     });
            // }

        } catch (err) {
            console.error("Error writing file or creating directory:", err);
            return res.status(500).json({ error: "Error writing file or creating directory:", err });
        }

        // Return the response as a JSON object
        return res.status(200).json({ result: response });
    } catch (err) {
        console.error("Error processing image:", err);
        return res.status(500).json({ error: "Error uploading image! Please try again! Error:", err });
    }
}
