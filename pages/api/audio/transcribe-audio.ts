import { NextApiRequest, NextApiResponse } from 'next';
//import formidable from 'formidable';
import fs from 'fs';
import OpenAI from "openai";
import { toFile } from 'openai/uploads';
//import axios from 'axios';
import FormData from 'form-data';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    //const form = new formidable.IncomingForm();
    //form.uploadDir = '/tmp';
    //form.keepExtensions = true;

    // We get the file as a base64 string
    const file = req.body.file;
    //console.log("WSPPPPP");
    //console.log(req);

    // Convert the base64 string to an .m4a file
    const audioFile = await toFile(Buffer.from(file, "base64"), 'audio.m4a');
    //const audioFile = await toFile(Buffer.from(file), 'audio.mp3');

    try {
        const transcription = await openai.audio.transcriptions.create({
            //file: fs.createReadStream("/path/to/file/audio.mp3"),
            file: audioFile,
            model: "whisper-1",
        });
        return res.status(200).json({ text: transcription.text });
    } catch (error: any) {
        console.error('Error transcribing audio:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to transcribe audio' });
    }


    //form.parse(req, async (err, fields, files) => {
    //  if (err) return res.status(500).json({ error: 'Error processing file' });

    //  const file = files.file?.[0];
    //  if (!file) return res.status(400).json({ error: 'No file uploaded' });

    //    const audioStream = fs.createReadStream(file.filepath);
    //    const formData = new FormData();
    //    formData.append('file', audioStream, { filename: 'audio.m4a' });
    //    formData.append('model', 'whisper-1');
    //    formData.append('language', 'en');

    //    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    //      headers: {
    //        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //        ...formData.getHeaders(),
    //      },
    //    });

    //    return res.status(200).json({ text: response.data.text });
    //  } catch (error: any) {
    //    console.error('Error transcribing audio:', error.response?.data || error.message);
    //    return res.status(500).json({ error: 'Failed to transcribe audio' });
    //  }
    //});
}