import { Message } from "./types";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "sua-chave-api-aqui";
const API_URL = "https://api.openai.com/v1/chat/completions";

// Mapeamento de nomes amigáveis para modelos reais da API
const MODEL_MAPPING = {
  "GPT-4": "gpt-4",
  "GPT-3.5-turbo": "gpt-3.5-turbo"
};

export async function fetchAIResponse(messages: Message[], model: string = "GPT-4"): Promise<string> {
  try {
    // Converter o nome amigável para o ID do modelo na API
    const apiModel = MODEL_MAPPING[model as keyof typeof MODEL_MAPPING] || "gpt-4";

    // Simulação de resposta para evitar problemas com API key
    console.log("API URL:", API_URL);
    console.log("Using API Key:", API_KEY.substring(0, 5) + "...");
    console.log("Messages:", messages.length, "items");
    console.log("Model:", model, "→", apiModel);

    // Retornar uma resposta simulada para fins de demonstração
    return "Esta é uma resposta simulada. Configure sua chave de API para obter respostas reais.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw error;
  }
}
