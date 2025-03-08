import { SessionContext } from "@/contexts/session";
import React, { useContext, useState, useEffect } from "react";
import { processImage, proccessImageFile } from "@/utils/imageInterface";
import { textToAudio} from "@/utils/audioInterface";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

type OpenAIVoice = 'alloy' | 'echo' | 'coral' | 'ash';

export default function ImageDescribePageLegacy() {
    const { session, setSession } = useContext(SessionContext);
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [description, setDescription] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>('alloy');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        setAudioElement(new Audio());
    }, []);

    const speakWithOpenAI = async (text: string, useExistingAudio: boolean = false) => {
        try {
            if (!audioElement) {
                console.error('Audio element is not initialized');
                toast.error('Audio element is not initialized');
                return;
            }

            setIsSpeaking(true);

            if (useExistingAudio && audioUrl) {
                audioElement.src = audioUrl;
                audioElement.onended = () => {
                    setIsSpeaking(false);
                };
                audioElement.play();
                return;
            }

            // const response = await fetch('/api/audio/generate-speech', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         text,
            //         voice: selectedVoice
            //     }),
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to generate speech');
            // }

            // get the audio from the text
            // const response = await textToAudio(text, selectedVoice);

            // const audioBlob = await response.blob();
            // const newAudioUrl = URL.createObjectURL(audioBlob);
            // setAudioUrl(newAudioUrl);

            // if (audioElement) {
            //     audioElement.src = newAudioUrl;
            //     audioElement.onended = () => {
            //         setIsSpeaking(false);
            //         URL.revokeObjectURL(newAudioUrl);
            //     };
            //     audioElement.play();
            // }
            setIsSpeaking(true);
            await textToAudio(text, selectedVoice);
            setIsSpeaking(false);
        } catch (error) {
            console.error('Error playing audio:', error);
            toast.error('An error occurred while playing the audio');
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.src = '';
            }
        };
    }, [audioElement]);

    async function handleInput() {
        try {
            if (!url && !file) {
                setError("Please provide an image URL or upload a file");
                return;
            }

            let result;
            if (file) {
                result = await proccessImageFile(file);
            } else {
                result = await processImage(url, "");
            }

            setDescription(result);
            speakWithOpenAI(result);
            setError("");
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the image");
            toast.error("An error occurred while processing the image");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-3xl font-semibold mb-8">Image Description Service</h1>

            <div className="w-full max-w-2xl space-y-8">
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL:</label>
                    <Input
                        type="text"
                        placeholder="Paste your image URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="p-4 border rounded w-full"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Or Upload Image File:</label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="border rounded w-full"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Voice:</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
                            { id: 'echo', name: 'Echo', description: 'Warm and rounded' },
                            { id: 'coral', name: 'Coral', description: 'Bright and crisp' },
                            { id: 'ash', name: 'Ash', description: 'Clear and direct' }
                        ].map((voice) => (
                            <button
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id as OpenAIVoice)}
                                className={`p-4 rounded-lg border transition-all ${selectedVoice === voice.id
                                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50'
                                        : 'border-gray-300 bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-400'
                                    }`}
                            >
                                <div className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-100">{voice.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{voice.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <Button
                        onClick={handleInput}
                        className={`px-8 py-3 rounded text-lg transition-all ${isSpeaking
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                            }`}
                        disabled={isSpeaking}
                    >
                        {isSpeaking ? 'Processing...' : 'Process Image'}
                    </Button>
                </div>

                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}

                {description && (
                    <div className="mt-8 p-6 bg-blue-900/50 rounded-lg border border-blue-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Image Description:</h3>
                            <Button
                                onClick={() => speakWithOpenAI(description, true)}
                                className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
                                disabled={isSpeaking}
                            >
                                {isSpeaking ? 'Speaking...' : 'Read Again'}
                            </Button>
                        </div>
                        <p className="text-white text-lg leading-relaxed">{description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}