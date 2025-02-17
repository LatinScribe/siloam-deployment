import { API_URL } from "./dataInterface";
// import { User, Session } from "./types";


const customAPIKey = process.env.CUSTOM_FILE_API_KEY || "default_api_key";
const customAPIurl = process.env.CUSTOM_FILE_API_PATH || "default_api_url";

export async function processImage(url: string): Promise<string> {
    try {
        //const role = "USER"
        const response = await fetch(`${API_URL}/api/image-process/image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageURL: url }),
        });
        // currently using backend for input checking!
        const responseData = await response.json();
        console.log(responseData);
        if (!response.ok) {
            throw new Error(responseData.error || "Unspecified error occurred");
        }
        return responseData.result.message.content;
    } catch (error) {
        console.error("An error occurred during image processing:", error);
        throw error;
    }
}

export async function generateImageLink(image: File): Promise<string> {
    try {
        // log that we are trying to generate a link
        console.log("Generating image link...\n");

        var based64Image = null;

        // encode the image into base 64
        const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

        based64Image = await toBase64(image);
        console.log(based64Image);

        // send the image to the backend
        console.log("Sending image to backend...\n");
        //const role = "USER"
        const response = await fetch(`${customAPIurl}/api/image-process/image-url-generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: based64Image, image_name: image.name, customAPIKey: customAPIKey }), // send the image and the name of the image
        });
        // currently using backend for input checking!
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || "Unspecified error occurred");
        }
        console.log(responseData.result.image_url);
        return responseData.result.image_url;
    } catch (error) {
        console.error("An error occurred during image processing:", error);
        throw error;
    }
}
