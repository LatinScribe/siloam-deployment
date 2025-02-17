import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text, voice } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice || "alloy",
            input: text,
        });

        // Get the audio data as an ArrayBuffer
        const audioData = await response.arrayBuffer();

        // Set the appropriate headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioData.byteLength);

        // Send the audio data
        res.send(Buffer.from(audioData));
    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ error: "Error generating speech" });
    }
} 