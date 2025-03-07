export interface Message {
    name : string;
    role : "user" | "system";
    content : any;
}

export interface OpenAIContext {
    messages: Message[];
}

// Probably kind of a hacky way to do this, but it works for now
export const contextCache : Map<string, OpenAIContext> = new Map();