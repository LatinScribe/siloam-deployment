import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const form = formidable({
        uploadDir: '/tmp',
        keepExtensions: true,
    });

    form.parse(req, async (err: any, _fields: any, files: any) => {
        if (err) return res.status(500).json({ error: 'Error processing file' });

        const file = files.file?.[0];
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        try {
            const audioStream = fs.createReadStream(file.filepath);
            const formData = new FormData();
            formData.append('file', audioStream, { filename: 'audio.m4a' });
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');

            interface TranscriptionResponse {
                text: string;
            }

            const response = await axios.post<TranscriptionResponse>('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    ...formData.getHeaders(),
                },
            });
            //if (typeof response.data.text === 'string') {
            return res.status(200).json({ text: response.data.text });
            //}

            // return res.status(500).json({ error: 'Failed to transcribe audio' });
        } catch (err: any) {
            console.error('Error transcribing audio:', err.response?.data || err.message);
            return res.status(500).json({ error: 'Failed to transcribe audio', err });
        }
    });
}