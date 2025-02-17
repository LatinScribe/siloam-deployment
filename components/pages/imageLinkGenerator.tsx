import { SessionContext } from "@/contexts/session";
import React, { useContext, useState } from "react";
import { generateImageLink } from "@/utils/imageInterface";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

type OpenAIVoice = 'alloy' | 'echo' | 'coral' | 'ash';

// Custom API output path from environment variables
const customAPIOutputPath = process.env.CUSTOM_FILE_OUTPUT_PATH || "NO_api_output_path";

export default function ImageLinkGeneratorPage() {
    // Session context to manage user session
    // const { session, setSession } = useContext(SessionContext);
    // State to store the uploaded image file
    const [imageFile, setImageFile] = useState<File | null>(null);
    // State to store any error messages
    const [error, setError] = useState("");
    // State to store the generated image link
    const [imageLink, setImageLink] = useState<string | null>(null);

    const router = useRouter();

    // Function to handle the form submission
    async function handleSubmit() {
        try {
            // Check if an image file is uploaded
            if (!imageFile) {
                setError("Please upload an image file");
                toast.error("An error occurred while uploading the image");
                return;
            }

            // Generate the image link using the uploaded file
            const result = await generateImageLink(imageFile);
            setImageLink(result);
            setError("");
        } catch (err: any) {
            // Handle any errors that occur during the image upload
            setError(err.message || "An error occurred while uploading the image");
            toast.error("An error occurred while uploading the image");
            return;
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
                    We successfully uploaded your image, which can be found at: <a href={customAPIOutputPath + imageLink}>{customAPIOutputPath + imageLink}</a>
                </p>
            )}
        </div>
    );
}
