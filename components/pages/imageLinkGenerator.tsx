import { SessionContext } from "@/contexts/session";
import React, { useContext, useState } from "react";
import { generateImageLink } from "@/utils/imageInterface";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type OpenAIVoice = 'alloy' | 'echo' | 'coral' | 'ash';

const customAPIurl = process.env.CUSTOM_FILE_API_PATH || "default_api_url";

export default function ImageLinkGeneratorPage() {
    const { session, setSession } = useContext(SessionContext);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [description, setDescription] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>('alloy');
    const [imageLink, setImageLink] = useState<string | null>(null);

    const router = useRouter();

    async function handleSubmit() {
        try {
            if (!imageFile) {
                setError("Please upload an image file");
                return;
            }

            const result = await generateImageLink(imageFile);
            setImageLink(result);
            setError("");
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the image");
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center' }}>Upload Image</h1>
            <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} 
                style={{ display: 'block', margin: '20px auto' }}
            />
            <Button onClick={handleSubmit} style={{ display: 'block', margin: '20px auto' }}>
                Submit
            </Button>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {imageLink && (
                <p style={{ textAlign: 'center' }}>
                    We successfully uploaded your image, which can be found at: <a href={imageLink}>{customAPIurl+imageLink}</a>
                </p>
            )}
        </div>
    );
}
