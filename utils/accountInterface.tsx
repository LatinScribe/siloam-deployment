const customAPIKey = process.env.CUSTOM_FILE_API_KEY || "NO_api_key";
const customAPIurl = process.env.CUSTOM_FILE_API_PATH || "NO_api_url";
const serverURL = process.env.SERVER_URL || "NO_server_url";
const customAPIOutputPath = process.env.CUSTOM_FILE_OUTPUT_PATH || "NO_api_output_path";

type OpenAIVoice = 'alloy' | 'echo' | 'coral' | 'ash';

/**
 * Converts the given text to audio using the specified voice.
 *
 * @param {string} text - The text to be converted to audio.
 * @param {OpenAIVoice} selectedVoice - The voice to be used for the audio conversion.
 * @returns {Promise<void>} - A promise that resolves when the audio is played.
 * @throws {Error} - Throws an error if the speech generation fails.
 */
export async function textToAudio(text: string, selectedVoice: OpenAIVoice): Promise<void> {
    try {
        const response = await fetch(`${serverURL}/api/audio/generate-speech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                voice: selectedVoice
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob(); // Get the audio blob
        const audioUrl = URL.createObjectURL(audioBlob); // Create a URL for the audio blob
        console.log("Audio URL:", audioUrl); // Log the audio URL for debugging

        const audioElement = new Audio(audioUrl); // Create a new audio element
        await audioElement.play(); // Play the audio
        console.log("Audio playback started."); // Log when playback starts
    } catch (error) {
        console.error("An error occurred in audio interface while processing text to speech:", error);
        throw error;
    }
}