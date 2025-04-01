// Make this one monolithic API endpoint that can handle both image and audio processing.
import { NextApiRequest, NextApiResponse } from 'next';
//import { verifyURL } from "@/utils/verification";
import OpenAI from "openai";
import { system_prompt } from "../../../prompts/image_caption_prompt";
//import { processImage, processBase64Image } from '@/utils/imageInterface';
//import { audioToText, textToAudio, textToAudioBlob} from '@/utils/audioInterface';
import { audioToText, textToAudioBlob} from '@/utils/audioInterface';
// import { text } from 'stream/consumers';
import { OpenAIVoice } from "@/utils/types";

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have an OpenAI API key
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Extract imageURL from the request body
    const { imageFile, audioFile, voice } = req.body as { imageFile: string, audioFile: string, voice: OpenAIVoice };

    // Check if imageURL is provided
    if (!imageFile) {
        return res.status(400).json({
            error: "Image data is required",
        });
    }

    try {
        // Transcribe the audio
        // TODO: This is a quick fix for the autoPhoto to work on the mobile side.
        let audioTranscription = "";
        if (audioFile) {
            audioTranscription = await audioToText(audioFile);
        } 

        // Get image description from our API
        //const imageDescription = await processBase64Image(imageFile, audioTranscription);
        // Call OpenAI API to generate a concise final response
        const modelResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: system_prompt,
                },
                {
                    role: "user",
                    content: [
                    {
                        "type": "text",
                        "text": `<DESCRIBE>: ${audioTranscription}`
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                        "url": `data:image/jpeg;base64,${imageFile}`
                        }
                    }
                    ]
                }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 150,
            store: true,
        });

        let response = modelResponse.choices[0].message.content;
        if (!response) {
            response = "";
        }


        // TODO: Add thing for voice, sync with Amaan
        let voice_used = voice;
        if (!voice_used) {
            voice_used = "alloy";
        }
        console.log("Voice: ", voice_used);
        
        const responseAudio = await textToAudioBlob(response, voice);
        console.log("Image and audio processed successfully!");

        // Return both responses as a JSON object
        return res.status(200).json({ ttsAudio: responseAudio });
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "An error occurred while requesting OpenAI to process the image" });
    }
}