import { SessionContext } from "@/contexts/session";
import React, { useContext, useEffect, useRef, useState } from "react";
import { processImage } from "@/utils/imageInterface";
import { textToAudio } from "@/utils/audioInterface";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { OpenAIVoice } from "@/utils/types";

const voiceOptions: OpenAIVoice[] = ['alloy', 'echo', 'coral', 'ash']; // Define available voices

export default function ImageDescribePage() {
    const { session, setSession } = useContext(SessionContext);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [finalResponse, setFinalResponse] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>('alloy'); // Default voice
    const [currentStep, setCurrentStep] = useState<string>("");
    const [isSpeaking, setIsSpeaking] = useState(false); // Track if speaking is in progress

    // Create a reference for the audio element
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        startCamera();
        // Initialize the audio element
        audioRef.current = new Audio('/mic_on.mp3'); // Path to your audio file
    }, []);

    const startCamera = async () => {
        if (videoRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        }
    };

    const captureImage = async () => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const imageData = canvasRef.current.toDataURL("image/png");
                setUrl(imageData);

                setCurrentStep("Analyzing Image...");

                await getDetailedDescription(imageData);
            }
        }
    };

    const getDetailedDescription = async (capturedUrl: string) => {
        try {
            console.log("Processing image at:", capturedUrl);
            const result = await processImage(capturedUrl, question);
            setError("");
            setDescription(result);
            setCurrentStep("Generating Text To Speech...");
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the image");
            toast.error("An error occurred while processing the image");
        }
    };

    const processQuestionWithDescription = async () => {
        try {
            // Prevent speaking if already in progress
            if (!isSpeaking) {
                setIsSpeaking(true); // Set speaking in progress
                setFinalResponse(description);
                await textToAudio(description, selectedVoice);
                setCurrentStep("Response received and spoken.");
                setIsSpeaking(false); // Reset speaking status
            }
        } catch (error) {
            console.error("Error processing question with description:", error);
            setError("An error occurred while processing the question");
        }
    };

    const startListening = () => {
        // Play the beep sound
        if (audioRef.current) {
            audioRef.current.play();
        }

        setIsListening(true);
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            setCurrentStep("Capturing image...");
            captureImage();
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            toast.error('Error recognizing speech');
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // Automatically process the question when the description is set
    useEffect(() => {
        if (description) {
            processQuestionWithDescription();
        }
    }, [description]);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-8">
            <div className="flex-1 mb-4 md:mb-0">
                <h1 className="text-3xl font-semibold mb-4">Describe Image</h1>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-2xl border border-gray-300 rounded"
                    style={{ height: 'auto', maxHeight: '480px' }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} width={640} height={480} />
            </div>

            <div className="flex-1">
                
                <div className="flex justify-center mt-6">
                    <button 
                        onClick={startListening} 
                        className="max-w-md px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                    >
                        <span className="text-6xl">▶️ Analyze</span> {/* Play button icon, increased size */}
                    </button>
                </div>
                <div className="space-y-2 mt-4">
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


                <div className="text-center mt-4">
                    {isListening && <span className="text-green-500">👂 Listening...</span>}
                </div>

                <div className="text-center mt-4">
                    <p className="text-lg font-medium">{currentStep}</p>
                </div>

                {/* Display the generated description */}
                {/* {description && (
                    <div className="text-center mt-4">
                        <p className="text-lg font-medium">Generated Description: {description}</p>
                    </div>
                )} */}

                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}

                {finalResponse && (
                    <div className="mt-8 p-6 bg-blue-900/50 rounded-lg border border-blue-700">
                        <h3 className="text-xl font-semibold">Final Response:</h3>
                        <p className="text-white text-lg leading-relaxed">{finalResponse}</p>
                    </div>
                )}

                {/* Voice Selection Grid */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    {voiceOptions.map((voice) => (
                        <button
                            key={voice}
                            onClick={() => setSelectedVoice(voice)}
                            className={`p-4 border rounded-lg text-black ${selectedVoice === voice ? 'bg-blue-500' : 'bg-gray-200'} hover:bg-blue-400`}
                            style={{ color: "black" }} // Ensures text stays black
                        >
                            {voice.charAt(0).toUpperCase() + voice.slice(1)}
                        </button>
                    ))}
                </div>


            </div>
        </div>
    );
}
