import { Message } from "./types"; const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "sua-chave-api-aqui"; const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL_MAPPING = {"GPT-4": "gpt-4", "GPT-3.5-turbo": "gpt-3.5-turbo"};
export async function fetchAIResponse(messages: Message[], model: string = "GPT-4"): Promise<string> { return "API key removed for security"; }
