// Make this one monolithic API endpoint that can handle both image and audio processing.
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyURL } from "@/utils/verification";
import OpenAI from "openai";
import { system_prompt } from "../../../prompts/image_caption_prompt";
import { processImage } from '@/utils/imageInterface';
import { audioToText, textToAudio, textToAudioBlob} from '@/utils/audioInterface';
import { text } from 'stream/consumers';
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
    // Check if the audio file is provided
    if (!audioFile) {
        return res.status(400).json({
            error: "Audio data is required",
        });
    }


    try {
        // Transcribe the audio
        const audioTranscription = await audioToText(audioFile);

        // Get image description from our API
        const imageDescription = await processImage(imageFile, audioTranscription);

        // TODO: Add thing for voice, sync with Amaan
        if (!voice) {
            const voice = "alloy";
        }
        const responseAudio = await textToAudioBlob(imageDescription, voice);
        console.log("Image and audio processed successfully!");

        // Return both responses as a JSON object
        return res.status(200).json({ ttsAudio: responseAudio });
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "An error occurred while requesting OpenAI to process the image" });
    }
}