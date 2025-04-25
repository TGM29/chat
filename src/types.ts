export interface Message { id: string; role: string; content: string; timestamp: number; }
export interface Conversation { id: string; title: string; messages: Message[]; createdAt: number; updatedAt: number; model: string; }
export interface ChatState { conversations: Conversation[]; activeConversationId: string | null; isLoading: boolean; error: string | null; }
