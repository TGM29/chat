import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchAIResponse } from './api';
import './App.css';

// Definir types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Components
const MessageList = ({ messages }: { messages: Message[] }) => {
  // Adicionar referência para o scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Função para rolar para o final da lista de mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Rolar para o final quando as mensagens mudarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
        >
          <div className="message-content">
            {message.content.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const InputForm = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false 
}: { 
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading && !disabled) {
      onSendMessage(trimmedValue);
      setInputValue('');
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={disabled ? "Selecione ou crie uma conversa..." : "Digite sua mensagem aqui..."}
          disabled={isLoading || disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isLoading || disabled}
          className="send-button"
        >
          Enviar
        </button>
      </div>
      {isLoading && <div className="loading-indicator">Pensando...</div>}
    </form>
  );
};

const ModelSelector = ({ 
  currentModel, 
  onModelChange 
}: { 
  currentModel: string; 
  onModelChange: (model: string) => void;
}) => {
  const models = ['GPT-4', 'GPT-3.5-turbo'];
  
  return (
    <div className="model-selector">
      <label htmlFor="model-select">Modelo: </label>
      <select 
        id="model-select"
        value={currentModel}
        onChange={(e) => onModelChange(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};

const ConversationHeader = ({ 
  title, 
  model, 
  onRename, 
  onModelChange 
}: { 
  title: string; 
  model: string; 
  onRename: (newTitle: string) => void; 
  onModelChange: (model: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleSubmit = () => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle) {
      onRename(trimmedTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className="conversation-header">
      {isEditing ? (
        <div className="title-edit">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
                setNewTitle(title);
              }
            }}
            autoFocus
          />
          <button className="confirm-button" onClick={handleSubmit}>
            Salvar
          </button>
        </div>
      ) : (
        <div className="title-display">
          <h1>{title}</h1>
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Editar
          </button>
        </div>
      )}
      <div className="header-actions">
        <ModelSelector currentModel={model} onModelChange={onModelChange} />
      </div>
    </div>
  );
};

const ConversationList = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onDeleteConversation 
}: { 
  conversations: Conversation[]; 
  activeConversationId: string | null; 
  onSelectConversation: (id: string) => void; 
  onDeleteConversation: (id: string) => void;
}) => {
  if (conversations.length === 0) {
    return (
      <div className="empty-conversations">
        <p>Nenhuma conversa ainda.</p>
      </div>
    );
  }

  // Sort conversations by updatedAt (most recent first)
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <div className="conversation-list">
      {sortedConversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`conversation-item ${
            conversation.id === activeConversationId ? 'active' : ''
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="conversation-title">{conversation.title}</div>
          <div className="conversation-actions">
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
              aria-label="Deletar conversa"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Definir o modelo padrão
const DEFAULT_MODEL = 'GPT-4';

// Load conversations from localStorage or use default empty array
const loadConversations = (): Conversation[] => {
  const saved = localStorage.getItem('conversations');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Adicionar o modelo para conversas antigas que não tenham
      return parsed.map((conv: any) => ({
        ...conv,
        model: conv.model || DEFAULT_MODEL
      }));
    } catch (e) {
      console.error('Failed to parse saved conversations', e);
    }
  }
  return [];
};

function App() {
  const [chatState, setChatState] = useState<ChatState>(() => {
    const conversations = loadConversations();
    const activeId = conversations.length > 0 ? conversations[0].id : null;
    
    return {
      conversations,
      activeConversationId: activeId,
      isLoading: false,
      error: null
    };
  });

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(chatState.conversations));
  }, [chatState.conversations]);

  const handleSendMessage = async (content: string) => {
    if (!chatState.activeConversationId) {
      // Create a new conversation if none exists
      handleNewConversation();
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Update the conversation with the new message
    setChatState(prev => {
      const updatedConversations = prev.conversations.map(conv => {
        if (conv.id === prev.activeConversationId) {
          // Update the title if this is the first message
          const newTitle = conv.messages.length === 0 
            ? content.substring(0, 30) + (content.length > 30 ? '...' : '') 
            : conv.title;
          
          return {
            ...conv,
            title: newTitle,
            messages: [...conv.messages, userMessage],
            updatedAt: Date.now()
          };
        }
        return conv;
      });

      return {
        ...prev,
        conversations: updatedConversations,
        isLoading: true,
        error: null
      };
    });

    try {
      // Get the active conversation
      const activeConversation = chatState.conversations.find(
        c => c.id === chatState.activeConversationId
      );
      
      if (!activeConversation) return;
      
      // Include the new user message
      const allMessages = [...activeConversation.messages, userMessage];
      const response = await fetchAIResponse(allMessages, activeConversation.model);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      // Update with the assistant's response
      setChatState(prev => {
        const updatedConversations = prev.conversations.map(conv => {
          if (conv.id === prev.activeConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: Date.now()
            };
          }
          return conv;
        });

        return {
          ...prev,
          conversations: updatedConversations,
          isLoading: false
        };
      });
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'Nova Conversa',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: DEFAULT_MODEL
    };

    setChatState(prev => ({
      ...prev,
      conversations: [newConversation, ...prev.conversations],
      activeConversationId: newConversation.id,
      error: null
    }));
  };

  const handleSelectConversation = (conversationId: string) => {
    setChatState(prev => ({
      ...prev,
      activeConversationId: conversationId,
      error: null
    }));
  };

  const handleDeleteConversation = (conversationId: string) => {
    setChatState(prev => {
      const updatedConversations = prev.conversations.filter(
        c => c.id !== conversationId
      );
      
      // Select the first conversation if we deleted the active one
      let newActiveId = prev.activeConversationId;
      if (newActiveId === conversationId) {
        newActiveId = updatedConversations.length > 0 ? updatedConversations[0].id : null;
      }
      
      return {
        ...prev,
        conversations: updatedConversations,
        activeConversationId: newActiveId,
        error: null
      };
    });
  };

  const handleRenameConversation = (newTitle: string) => {
    if (!chatState.activeConversationId) return;

    setChatState(prev => {
      const updatedConversations = prev.conversations.map(conv => {
        if (conv.id === prev.activeConversationId) {
          return {
            ...conv,
            title: newTitle,
            updatedAt: Date.now()
          };
        }
        return conv;
      });

      return {
        ...prev,
        conversations: updatedConversations
      };
    });
  };

  const handleModelChange = (newModel: string) => {
    if (!chatState.activeConversationId) return;

    setChatState(prev => {
      const updatedConversations = prev.conversations.map(conv => {
        if (conv.id === prev.activeConversationId) {
          return {
            ...conv,
            model: newModel,
            updatedAt: Date.now()
          };
        }
        return conv;
      });

      return {
        ...prev,
        conversations: updatedConversations
      };
    });
  };

  // Get the active conversation
  const activeConversation = chatState.conversations.find(
    c => c.id === chatState.activeConversationId
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Conversas</h2>
          <button 
            className="new-chat-button"
            onClick={handleNewConversation}
          >
            + Nova Conversa
          </button>
        </div>
        <ConversationList 
          conversations={chatState.conversations}
          activeConversationId={chatState.activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </aside>
      <div className="main-content">
        {activeConversation ? (
          <>
            <header className="app-header">
              <ConversationHeader
                title={activeConversation.title}
                model={activeConversation.model || DEFAULT_MODEL}
                onRename={handleRenameConversation}
                onModelChange={handleModelChange}
              />
            </header>
            <main className="chat-container">
              <MessageList messages={activeConversation.messages} />
              {chatState.error && (
                <div className="error-message">
                  <p>Erro: {chatState.error}</p>
                </div>
              )}
            </main>
          </>
        ) : (
          <div className="empty-state">
            <p>Nenhuma conversa selecionada. Crie uma nova conversa para começar.</p>
          </div>
        )}
        <footer className="app-footer">
          <InputForm
            onSendMessage={handleSendMessage}
            isLoading={chatState.isLoading}
            disabled={!chatState.activeConversationId}
          />
        </footer>
      </div>
    </div>
  );
}

export default App;
