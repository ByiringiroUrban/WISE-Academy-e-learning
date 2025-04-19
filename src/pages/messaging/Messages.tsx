import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { chatAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);
  
  useEffect(() => {
    if (initialUserId) {
      startNewConversation(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.data.conversations || []);
      
      // If we have conversations and none selected yet, select the first one
      if (response.data.data.conversations?.length > 0 && !initialUserId) {
        setSelectedConversation(response.data.data.conversations[0]);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data.data.messages || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    if (!selectedConversation) {
      toast({
        title: "Error",
        description: "No conversation selected",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await chatAPI.sendMessage(selectedConversation._id, messageText.trim());
      
      // Add optimistic message
      setMessages([...messages, {
        _id: Date.now().toString(),
        text: messageText,
        createdAt: new Date().toISOString(),
        sender: { _id: user?._id, name: user?.name },
        optimistic: true,
      }]);
      
      // Clear input
      setMessageText("");
      
      // Refresh messages
      fetchMessages(selectedConversation._id);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  const startNewConversation = async (userId: string) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        conv => conv.participants.some((p: any) => p._id === userId)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        return;
      }
      
      // Create new conversation
      const response = await chatAPI.createConversation({ userId });
      const newConversation = response.data.data.conversation;
      
      // Add to conversations list
      setConversations([newConversation, ...conversations]);
      
      // Select the new conversation
      setSelectedConversation(newConversation);
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to start conversation",
        variant: "destructive",
      });
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const getOtherUser = (conversation: any) => {
    if (!conversation || !conversation.participants) return { name: 'Unknown' };
    return conversation.participants.find((p: any) => p._id !== user?._id) || { name: 'Unknown' };
  };

  return (
    
    <div className="container mx-auto  px-4">
  <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Conversations List */}
        <div className="md:col-span-1">
          <Card className="h-[calc(80vh-2rem)]">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-61px)]">
              {isLoading ? (
                <div className="p-4 text-center">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              ) : (
                <ul>
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    return (
                      <li 
                        key={conversation._id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?._id === conversation._id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="font-medium">{otherUser.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>
        </div>
        
        {/* Messages */}
        <div className="md:col-span-2">
          <Card className="h-[calc(80vh-2rem)] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b flex-shrink-0">
                  <h2 className="font-semibold text-lg">{getOtherUser(selectedConversation).name}</h2>
                </div>
                <CardContent className="flex-grow overflow-y-auto p-4">
                  {isLoadingMessages ? (
                    <div className="text-center py-4">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.sender._id === user?._id;
                        return (
                          <div 
                            key={message._id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isOwnMessage 
                                  ? 'bg-primary text-white rounded-br-none'
                                  : 'bg-gray-100 rounded-bl-none'
                              }`}
                            >
                              <div>{message.text}</div>
                              <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                                {formatDate(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t flex-shrink-0">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>Send</Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation or start a new one
              </div>
            )}
          </Card>
        </div>
      </div>
      </DashboardLayout>
    </div>
  );
}
