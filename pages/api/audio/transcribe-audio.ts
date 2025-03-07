import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import OpenAI from "openai";
import { toFile } from 'openai/uploads';
import FormData from 'form-data';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }


  // We get the file as a base64 string
  const file = req.body.file;

  // Convert the base64 string to an .m4a file
  const audioFile = await toFile(Buffer.from(file, "base64"), 'audio.m4a');

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    return res.status(200).json({ text: transcription.text });
  } catch (error: any) {
    console.error('Error transcribing audio:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}