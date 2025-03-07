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
 * API handler to process audio upload and generate a URL for the uploaded audio.
 * 
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
/**
 * API handler for processing audio uploads.
 * 
 * This function handles POST requests to upload an audio in base64 format,
 * validates the provided API key, and saves the audio to the server's file system.
 * 
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The outgoing response object.
 * 
 * @returns {Promise<void>} - A promise that resolves when the request is handled.
 * 
 * @throws {Error} - Throws an error if the request method is not POST, 
 *                   if the API key is invalid, if the audio is not provided or not in base64 format,
 *                   or if there is an error writing the file or creating the directory.
 * 
 * @example
 * // Example request body:
 * // {
 * //   "audio": "data:audio/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 * //   "audio_name": "example.png",
 * //   "customAPIKey": "your_custom_api_key"
 * // }
 * 
 * @example
 * // Example response:
 * // {
 * //   "result": {
 * //     "audio_url": "/uploaded-audio/example.png"
 * //   }
 * // }
 * 
 * @remarks
 * - The audio must be provided in base64 format (dataURL).
 * - The audio_name must be a string.
 * - The customAPIKey must match the predefined API key.
 * - The function ensures that the uploaded audio file name is unique by appending a counter if necessary.
 * - The function creates the necessary directories if they do not exist.
 * - The function logs the progress and errors to the console.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("Starting audio upload");

    // Extract audio, audio_name, and customAPIKey from the request body
    const { audio, audio_name, customAPIKey } = req.body;

    // Validate the custom API key
    if (customAPIKey !== customApiKey) {
        return res.status(401).json({
            error: "Invalid API Key",
        });
    }

    // Ensure an audio is provided in base64 format
    if (!audio) {
        return res.status(400).json({
            error: "Please provide audio in base 64 format",
        });
    }

    // Validate that audio and audio_name are strings
    if (typeof audio !== 'string' || typeof audio_name !== 'string') {
        return res.status(400).json({
            error: "Please provide valid audio and audio_name as strings",
        });
    }

    try {
        console.log(`Attempting to upload audio named: ${audio_name}`);

        // Remove the base64 prefix from the audio string
        const trimmedString = audio.replace(/^data:audio\/\w+;base64,/, "");

        // Convert the audio from base64 to a Buffer
        const audioBuffer = Buffer.from(trimmedString, "base64");
        let audioFileName = audio_name;
        let audioPath = path.join(process.cwd(), "public/uploaded-audio", audioFileName);
        let counter = 1;

        // Check if file already exists and modify the name if it does
        while (fs.existsSync(audioPath)) {
            const ext = path.extname(audio_name);
            const baseName = path.basename(audio_name, ext);
            audioFileName = `${baseName}_${counter}${ext}`;
            audioPath = path.join(process.cwd(), "public/uploaded-audio", audioFileName);
            counter++;
        }

        // Ensure the directory exists
        const dir = path.dirname(audioPath);
        let response;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the file to the determined path
            await fs.promises.writeFile(audioPath, audioBuffer);
            response = { audio_url: `/uploaded-audio/${audioFileName}` };

            console.log("audio uploaded successfully at: ", audioPath);

            // TODO: Implement the verifyURL function to verify the URL
            // if (!verifyURL(audioURL)) {
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
        console.error("Error processing audio:", err);
        return res.status(500).json({ error: "Error uploading audio! Please try again! Error:", err });
    }
}
