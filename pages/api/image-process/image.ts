import { NextApiRequest, NextApiResponse } from 'next';
import { verifyURL } from "@/utils/verification";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have an openai api key
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // only allows for POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // passed in a image url
    const { imageURL } = req.body as { imageURL: string };

    // must provide an image URL
    if (!imageURL) {
        return res.status(400).json({
            error: "Please provide an image URL",
        });
    }

    // verify the URL 
    // TODO: Implement the verifyURL function
     if (!verifyURL(imageURL)) {
        return res.status(400).json({
            error: "Invalid URL provided",
        });
     }

    try {
        console.log(`Processing image at: ${imageURL}`);
        
        // Implement image processing to API
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

        // set up the return as a JSON object
        return res.status(200).json({ result: response.choices[0] });
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "Error processing image! Please try again!" });
    }
}
