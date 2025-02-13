
import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, StopCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "../hooks/use-toast";
import { ChatSidebar } from "./ChatSidebar";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export function Chat() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        const fileContent = selectedFile.type.startsWith('image/') 
          ? `Analyze this image: ${base64String}`
          : `Analyze this file content: ${base64String}`;
          
        setInput(fileContent);
      };
      
      if (selectedFile.type.startsWith('image/')) {
        reader.readAsDataURL(selectedFile);
      } else {
        reader.readAsText(selectedFile);
      }

      toast({
        title: "File uploaded",
        description: selectedFile.name,
      });
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateResponse = async (userInput: string) => {
    const GEMINI_API_KEY = "AIzaSyAxbXjO0yTziA1ZJCu1I9833cZPcYZNUHo";
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    try {
      // Get last 20 messages for context
      const contextMessages = messages.slice(-20);
      const conversationContext = contextMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `Previous conversation:\n${conversationContext}\n\nCurrent message: ${userInput}`;

      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    if (!activeChat) {
      const newChatId = uuidv4();
      const newChat: ChatHistory = {
        id: newChatId,
        title: input.slice(0, 30) + "...",
        messages: [userMessage],
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, newChat]);
      setActiveChat(newChatId);
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateResponse(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update chat history
      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, userMessage, assistantMessage] }
          : chat
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (file) clearFile();
    }
  };

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setActiveChat(chatId);
      setMessages(selectedChat.messages);
    }
  };

  const handleChatDelete = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chatHistory}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onChatDelete={handleChatDelete}
      />
      <div className="flex-1 flex flex-col h-screen max-w-4xl mx-auto p-4">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-lg glass-morphism"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg message-transition ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-lg p-4">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,image/*"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="shrink-0">
            {isLoading ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        {file && (
          <div className="mt-2 p-2 bg-secondary rounded-lg flex items-center justify-between">
            <span className="truncate">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="ml-2"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
