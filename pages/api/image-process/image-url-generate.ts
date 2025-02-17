import { NextApiRequest, NextApiResponse } from 'next';
import { verifyURL } from "@/utils/verification";
import path from 'path';
import fs from 'fs';
// import OpenAI from "openai";

const customApiKey = process.env.CUSTOM_FILE_API_KEY;

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' // Set desired value here
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // only allows for POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("starting image upload");
    console.log(req.body);

    // passed in a image url
    const { image, image_name, customAPIKey } = req.body;

    if (customAPIKey !== customApiKey) {
        return res.status(401).json({
            error: "Invalid API Key",  
        });
    }

    // must provide an image in base 64 format
    if (typeof image !== 'string' || typeof image_name !== 'string') {
        return res.status(400).json({
            error: "Please provide valid image and image_name as strings",
        });
    }

    if (!image) {
        return res.status(400).json({
            error: "Please provide an image in base 64 format",
        });
    }

    // verify the URL 
    // TODO: Implement the verifyURL function
    //  if (!verifyURL(imageURL)) {
    //     return res.status(400).json({
    //         error: "Invalid URL provided",
    //     });
    //  }

    try {
        console.log(`Attempting to upload image named: ${image_name}`);

        const trimmedString = image.replace(/^data:image\/\w+;base64,/, "");
        //const imageContent = atob(trimmedString);
        //const buffer = new ArrayBuffer(imageContent.length);
        //const view = new Uint8Array(buffer);



        // convert the image from base64 to a file
        const imageBuffer = Buffer.from(trimmedString, "base64");
        let imageFileName = image_name;
        let imagePath = path.join(process.cwd(), "public/uploaded-images", imageFileName);
        let counter = 1;

        // function dataURLtoBlob(dataurl) {
        //     var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        //     while(n--){
        //         u8arr[n] = bstr.charCodeAt(n);
        //     }
        //     return new Blob([u8arr], {type:mime});
        // }

        // convert the base64 image to a blob
        // var blob = dataURLtoBlob(imageBuffer);


        // Check if file already exists and modify the name if it does
        while (fs.existsSync(imagePath)) {
            const ext = path.extname(image_name);
            const baseName = path.basename(image_name, ext);
            imageFileName = `${baseName}_${counter}${ext}`;
            imagePath = path.join(process.cwd(), "public/uploaded-images", imageFileName);
            counter++;
        }

        // Ensure the directory exists
        const dir = path.dirname(imagePath);
        let response;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the file to the determined path
            await fs.promises.writeFile(imagePath, imageBuffer);
            response = { image_url: `/uploaded-images/${imageFileName}` };

            console.log("Image uploaded successfully at: ", imagePath);
        } catch (err) {
            console.error("Error writing file or creating directory:", err);
            return res.status(500).json({ error: "Error processing image! Please try again!" });
        }

        // set up the return as a JSON object
        return res.status(200).json({ result: response });
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "Error processing image! Please try again!" });
    }
}
