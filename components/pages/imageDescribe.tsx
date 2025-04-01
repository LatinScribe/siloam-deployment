import { SessionContext } from "@/contexts/session";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { processImage, processImageWithHistory } from "@/utils/imageInterface";
import { addInteraction } from "@/utils/accountInterface";
import { verifyToken, attemptRefreshAccess, verifyTokenLocal} from "@/utils/auth";
import { textToAudio } from "@/utils/audioInterface";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { OpenAIVoice, Message } from "@/utils/types";
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

const voiceOptions: OpenAIVoice[] = ['alloy', 'echo', 'coral', 'ash']; // Define available voices

// Create the orb styled components (add these outside your component function)
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1); 
    opacity: 1;
  }
`;

const breathe = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

const listen = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  60% {
    transform: scale(0.95);
  }
`;

const waveKeyframes = keyframes`
  0% {
    height: 5px;
  }
  50% {
    height: 30px;
  }
  100% {
    height: 5px;
  }
`;

const OrbContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Orb = styled.div<{ state: 'idle' | 'listening' | 'processing' | 'speaking' }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  
  ${({ state }) => {
    switch (state) {
      case 'idle':
        return css`
          background: linear-gradient(145deg, #3b82f6, #1d4ed8);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
          animation: ${breathe} 4s infinite ease-in-out;
        `;
      case 'listening':
        return css`
          background: linear-gradient(145deg, #ef4444, #b91c1c);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
          animation: ${pulse} 1.5s infinite;
        `;
      case 'processing':
        return css`
          background: linear-gradient(145deg, #a855f7, #7e22ce);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.7);
          animation: ${listen} 1s infinite;
        `;
      case 'speaking':
        return css`
          background: linear-gradient(145deg, #10b981, #047857);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.7);
        `;
      default:
        return css``;
    }
  }}
  
  &:active {
    transform: scale(0.95);
  }
`;

const OrbText = styled.div`
  margin-top: 15px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
`;

const WaveContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 3px;
  position: absolute;
`;

const WaveBar = styled.div<{ delay: number }>`
  width: 4px;
  height: 5px;
  background-color: white;
  border-radius: 2px;
  animation: ${waveKeyframes} 1.2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// Add this right after your existing styled components and before the component declaration
// This creates the custom scrollbar styles
const GlobalStyle = createGlobalStyle`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.8);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.8);
  }
`;

export default function ImageDescribePage() {
    const { session, setSession } = useContext(SessionContext);
    const router = useRouter();

    // uncomment this if you want to force login
    // useEffect(() => {
    //     if (!session || !session?.accessToken || !session?.refreshToken) {
    //         router.replace("/login");
    //     }
    // }, [session, router]);

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
    const [debugInfo, setDebugInfo] = useState<string[]>([]);
    const [orbState, setOrbState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

    const addEntryToInteractionHistory = async (type: string, question: string, imageURL: string) => {
        if (session && session.accessToken && session.refreshToken) {
            try {
                const interaction = {type: type, question: question, imageURL: imageURL};
                const interactions = await addInteraction(session.accessToken, session.refreshToken, interaction);
            } catch (error) {
                console.error("Error adding to interaction history:", error);
            }
        } else {
            // router.push("/login");
            console.log("User not logged in. Not saving interaction history!");
        }
    };


    // Create a reference for the audio element
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // In your component, add a new state for conversation history
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

    // Create a reference for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const captureImage = async (transcriptQuestion: string) => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                setDebugInfo(prev => [...prev, "STEP 3: Capturing image..."]);
                
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const imageData = canvasRef.current.toDataURL("image/png");
                setUrl(imageData);

                setCurrentStep("Analyzing image with question: " + transcriptQuestion);
                setDebugInfo(prev => [...prev, `STEP 4: Captured image, passing it with question: "${transcriptQuestion}"`]);
                
                // Pass the question directly to getDetailedDescription
                await getDetailedDescription(imageData, transcriptQuestion);
            }
        }
    };

    const getDetailedDescription = async (capturedUrl: string, transcriptQuestion: string) => {
        try {
            setOrbState('processing'); // Update UI state
            
            console.log("Processing image at:", capturedUrl);
            console.log("With question:", transcriptQuestion);
            
            setDebugInfo(prev => [...prev, `STEP 5: Calling processImage with question: "${transcriptQuestion}"`]);
            
            //const result = await processImage(capturedUrl, transcriptQuestion);

            const result = await processImageWithHistory(capturedUrl, conversationHistory, transcriptQuestion);

            setConversationHistory(prev => [
                ...prev,
                {
                    id: `user-${Date.now()}`,
                    role: 'user',
                    content: transcriptQuestion,
                    timestamp: new Date()
                },
            ])

            addEntryToInteractionHistory("user-question", transcriptQuestion, capturedUrl);

            setError("");
            setDescription(result);
            
            setDebugInfo(prev => [...prev, `STEP 6: Received response: "${result.substring(0, 50)}..."`]);
            
            setCurrentStep("Generating Text To Speech...");
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the image");
            toast.error("An error occurred while processing the image");
            setDebugInfo(prev => [...prev, `ERROR: ${err.message || "Unknown error processing image"}`]);
            setOrbState('idle'); // Return to idle state on error
        }
    };

    const processQuestionWithDescription = async () => {
        try {
            // Prevent speaking if already in progress
            if (!isSpeaking) {
                // Update state for UI
                setOrbState('speaking');
                
                // Vibrate to indicate speaking
                if ('vibrate' in navigator) {
                    navigator.vibrate([30, 50, 30, 50, 30]);
                }
                
                setIsSpeaking(true);
                setFinalResponse(description);
                
                // Add the user's question and AI's response to conversation history
                setConversationHistory(prev => [
                    ...prev,
                    {
                        id: `assistant-${Date.now()+1}`,
                        role: 'assistant',
                        content: description,
                        timestamp: new Date()
                    }
                ]);

                //addEntryToInteractionHistory("assistant-response", description, "");
                
                await textToAudio(description, selectedVoice);
                setCurrentStep("Response received and spoken.");
                setIsSpeaking(false);
                
                // Return to idle state
                setTimeout(() => {
                    setOrbState('idle');
                }, 1000);
            }
        } catch (error) {
            console.error("Error processing question with description:", error);
            setError("An error occurred while processing the question");
            setOrbState('idle');
        }
    };

    const startListening = () => {
        // Trigger vibration if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(100); // Short vibration (100ms)
        }

        // Play the beep sound
        if (audioRef.current) {
            audioRef.current.play();
        }

        // Clear previous debug info
        setDebugInfo(["STEP 1: Starting to listen for question..."]);
        
        // Update UI state
        setOrbState('listening');
        setIsListening(true);
        setCurrentStep("Listening for your question...");
        
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            
            // Update debug info
            setDebugInfo(prev => [...prev, `STEP 2: Question received: "${transcript}"`]);
            
            // Update UI state
            setOrbState('processing');
            setCurrentStep("Question received: " + transcript + ". Now capturing image...");
            
            // Vibrate to indicate processing
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 100, 50]);
            }
            
            // Pass the transcript directly to captureImage
            setTimeout(() => {
                captureImage(transcript);
            }, 500);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            toast.error('Error recognizing speech');
            setIsListening(false);
            setOrbState('idle');
            setDebugInfo(prev => [...prev, `ERROR: Speech recognition failed: ${event.error}`]);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Only return to idle if we're still in listening state
            // (otherwise we'd interfere with the processing or speaking states)
            if (orbState === 'listening') {
                setOrbState('idle');
            }
        };

        recognition.start();
    };

    // Automatically process the question when the description is set
    useEffect(() => {
        if (description) {
            processQuestionWithDescription();
        }
    }, [description]);

    // Replace your current auto-scroll useEffect with this one
    useEffect(() => {
        // When displaying newest messages at the top, we want to scroll to the top when new messages arrive
        if (conversationHistory.length > 0) {
            // Get the scrollable container
            const scrollContainer = document.querySelector('.custom-scrollbar');
            if (scrollContainer) {
                scrollContainer.scrollTop = 0; // Scroll to the top
            }
        }
    }, [conversationHistory]);

    return (
        <>
            <GlobalStyle /> {/* Add this to inject the styles */}
            <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white overflow-hidden">
                {/* Background subtle grid effect */}
                <div className="absolute inset-0 bg-grid-gray-300/[0.05] bg-[size:50px_50px] pointer-events-none"></div>
                <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"></div>
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl"></div>
                
                <div className="relative z-10 w-full h-full max-w-6xl mx-auto p-6 flex flex-col">
                    {/* Maintain fixed height but with flex-shrink-0 to prevent compression */}
                    <div className="flex flex-col md:flex-row gap-6 mb-4 h-[45%] flex-shrink-0">
                        {/* Video section */}
                        <div className="flex-1 min-w-0">
                            <div className="relative h-full">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="relative w-full h-full object-cover rounded-xl border border-gray-700 shadow-xl bg-black"
                                />
                            </div>
                            <canvas ref={canvasRef} style={{ display: "none" }} width={640} height={480} />
                        </div>

                        {/* Controls section */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-300 shadow-xl h-full flex flex-col">
                                <OrbContainer className="flex-grow flex items-center justify-center">
                                    <Orb state={orbState} onClick={!isListening ? startListening : undefined}>
                                        {orbState === 'speaking' && (
                                            <WaveContainer>
                                                {[...Array(8)].map((_, i) => (
                                                    <WaveBar key={i} delay={i * 0.1} />
                                                ))}
                                            </WaveContainer>
                                        )}
                                    </Orb>
                                    <OrbText>
                                        {orbState === 'idle' && "Tap to speak"}
                                        {orbState === 'listening' && "Listening..."}
                                        {orbState === 'processing' && "Processing..."}
                                        {orbState === 'speaking' && "Speaking..."}
                                    </OrbText>
                                </OrbContainer>

                                {error && (
                                    <div className="p-3 bg-red-100 rounded-lg border border-red-300 text-red-700 animate-pulse text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-auto"> 
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Voice Options</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {voiceOptions.map((voice) => (
                                            <button
                                                key={voice}
                                                onClick={() => setSelectedVoice(voice)}
                                                className={`relative group overflow-hidden p-3 rounded-xl text-sm transition-all duration-300 ${
                                                    selectedVoice === voice 
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg' 
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                }`}
                                            >
                                                {selectedVoice === voice && (
                                                    <span className="absolute inset-0 bg-white/20 animate-pulse-slow rounded-xl"></span>
                                                )}
                                                <span className="relative z-10 font-medium">
                                                    {voice.charAt(0).toUpperCase() + voice.slice(1)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conversation section - explicitly set to take the remaining height */}
                    <div className="h-[50%] overflow-hidden">
                        {conversationHistory.length > 0 ? (
                            <div className="h-full relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative h-full p-4 bg-white/90 backdrop-blur-md rounded-xl border border-gray-300 shadow-xl flex flex-col">
                                    <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2 flex-shrink-0">Conversation</h3>
                                    
                                    {/* Make sure this container scrolls - using absolute height calculation */}
                                    <div className="h-[calc(100%-2rem)] overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="flex flex-col space-y-3">
                                            {/* Reverse the array to display newest messages first */}
                                            {[...conversationHistory].reverse().map((message) => (
                                                <div 
                                                    key={message.id} 
                                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div 
                                                        className={`
                                                            max-w-[80%] px-4 py-3 rounded-2xl 
                                                            ${message.role === 'user' 
                                                                ? 'bg-blue-500 text-white rounded-tr-none' 
                                                                : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                                            }
                                                        `}
                                                    >
                                                        <p className="leading-relaxed">{message.content}</p>
                                                        <div className={`text-xs mt-1 opacity-70 ${message.role === 'user' ? 'text-right' : ''}`}>
                                                            {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))} 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                                <div className="text-center">
                                    <p>No conversation yet</p>
                                    <p className="text-sm mt-2">Tap the orb to start speaking</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
