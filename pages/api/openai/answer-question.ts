import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
//import { OpenAIContext, contextCache, Message } from '@/lib/context';
//import { system_prompt } from '@/prompts/image_caption_prompt';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// const user = 'admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // const { description, question, imageUrl } = req.body;
    const { question, imageUrl } = req.body;

    if (!imageUrl || !question) {
        return res.status(400).json({ error: "Image URL and question are required" });
    }

    try {
        // Use the Vision API format with both text and image
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: question 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        // TODO: Replace this with a DB call or have this cache get flushed periodically and written to a DB. Or make this client-side
        //const sys_prompt: Message[] = [{name: "", role: "system", content: system_prompt}];
        //let curContext: OpenAIContext = contextCache.get(user) || { messages: [] };
        //curContext.messages.concat(sys_prompt);

        //const response = await openai.chat.completions.create({
        //    model: "gpt-4o-mini",
        //    messages: curContext.messages
        //});

        //// Update the cache
        //contextCache.set(user, curContext);

        return res.status(200).json({ result: response.choices[0].message.content });
    } catch (error) {
        console.error("Error processing question:", error);
        return res.status(500).json({ error: "An error occurred while processing the question" });
    }
} 