import { NextApiRequest, NextApiResponse } from 'next';
import { verifyURL } from "@/utils/verification";
import OpenAI from "openai";

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have an OpenAI API key
});

/**
 * API handler to process an image URL and return a description.
 * 
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 */
/**
 * API handler for processing images and generating descriptions using OpenAI's API.
 * 
 * @param req - The HTTP request object, expected to be a POST request with a JSON body containing an `imageURL` string.
 * @param res - The HTTP response object used to send back the result or error message.
 * 
 * @returns A JSON response containing the generated description or an error message.
 * 
 * @remarks
 * This function only allows POST requests. It extracts the `imageURL` from the request body and verifies it.
 * If the URL is valid, it calls the OpenAI API to process the image and generate a description.
 * 
 * @throws Will return a 405 status code if the request method is not POST.
 * @throws Will return a 400 status code if the `imageURL` is not provided or is invalid.
 * @throws Will return a 500 status code if there is an error during the image processing.
 * 
 * @example
 * // Example request body
 * {
 *   "imageURL": "https://example.com/image.jpg"
 * }
 * 
 * // Example response body
 * {
 *   "result": {
 *     "text": "A description of the image."
 *   }
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract imageURL from the request body
    const { imageURL } = req.body as { imageURL: string };

    // Check if imageURL is provided
    if (!imageURL) {
        return res.status(400).json({
            error: "Please provide an image URL",
        });
    }

    // Verify the provided URL
    // TODO: Implement the verifyURL function
    if (!verifyURL(imageURL)) {
        return res.status(400).json({
            error: "Invalid URL provided",
        });
    }

    try {
        console.log(`Processing image at: ${imageURL}`);

        // Call OpenAI API to process the image and generate a description
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this image as if speaking to a visually impaired person. Be clear, concise, and focus on useful details without being overly descriptive." },
                        {
                            type: "image_url",
                            image_url: { url: imageURL },
                        },
                    ],
                },
            ],
            store: true,
        });

        console.log("Image processed successfully!");

        // Return the result as a JSON object
        return res.status(200).json({ result: response.choices[0] });
    } catch (error) {
        console.error("Error processing image:", error);
        // const errorMessage = (error as Error).message || "An error occurred while processing the image";
        const errorMessage = "An error occurred while requesting OpenAI to process the image";
        return res.status(500).json({ error: errorMessage });
    }
}
