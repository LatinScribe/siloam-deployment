import { NextApiRequest, NextApiResponse } from 'next';
import { verifyURL } from "@/utils/verification";
import OpenAI from "openai";
import { system_prompt } from "../../../prompts/image_caption_prompt";

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have an OpenAI API key
});

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
    const { imageURL, request } = req.body as { imageURL: string, request: string};

    // Check if imageURL is provided
    if (!imageURL) {
        return res.status(400).json({
            error: "Image URL is required",
        });
    }

    // Verify the provided URL
    if (!verifyURL(imageURL)) {
        return res.status(400).json({
            error: "Invalid URL provided",
        });
    }

    try {
        console.log("Request received:", request);

        // Call OpenAI API to generate a concise final response
        console.log("Sending to OpenAI with model gpt-4o-mini");
        console.log("System prompt:", system_prompt.substring(0, 100) + "...");
        console.log("User message:", request ? `Please directly answer this question about the image: "${request}"` : "What am I looking at?");
        
        const modelResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: system_prompt + "\n\nIMPORTANT INSTRUCTION: The user has asked the following specific question: \"" + 
                              request + "\". Your task is to DIRECTLY answer this question based on the image content. DO NOT just describe the image generally unless no question was asked.",
                },
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: request ? `ANSWER THIS QUESTION DIRECTLY: "${request}"` : "What am I looking at?"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageURL,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const response = modelResponse.choices[0].message.content;

        console.log("OpenAI response received");
        console.log("Image processed successfully!");
        console.log("Response:", response);

        // Return both responses as a JSON object
        return res.status(200).json({ response: response});
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "An error occurred while requesting OpenAI to process the image" });
    }
}
