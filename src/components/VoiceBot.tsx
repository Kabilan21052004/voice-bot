import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { GoogleAuthService } from '@/services/googleAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Bot, 
  User,
  Phone,
  PhoneOff
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const ELEVENLABS_AGENT_ID = 'agent_01jzvrgx8pff7btgjfwb8js84h';

export function VoiceBot() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const googleSignInRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Voice conversation started",
      });
    },
    onDisconnect: () => {
      setIsConnected(false);
      setConversationId(null);
      toast({
        title: "Disconnected",
        description: "Voice conversation ended",
      });
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      
      if (message.message?.trim()) {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: message.message,
          type: message.source === 'user' ? 'user' : 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
      }
      
      // Show typing indicator for assistant responses
      if (message.source === 'ai' && !message.message) {
        setIsTyping(true);
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast({
        title: "Error",
        description: "Something went wrong with the voice conversation",
        variant: "destructive",
      });
    },
    clientTools: {
      get_user_email: () => {
        const userEmail = GoogleAuthService.getInstance().getUserEmail();
        const phoneNumber = GoogleAuthService.getInstance().getUserPhoneNumber();
        return JSON.stringify({
          user_email: userEmail || 'No user email available',
          phone_number: phoneNumber || 'No phone number available'
        });
      }
    }
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const authService = GoogleAuthService.getInstance();
      await authService.initialize('844002845433-04e9jb4i8hu404usig2sm4hnqt18skml.apps.googleusercontent.com');
      
      authService.onAuthStateChanged((user) => {
        setUser(user);
        if (user && googleSignInRef.current) {
          googleSignInRef.current.style.display = 'none';
        }
      });

      // Render sign-in button if user is not authenticated
      if (!authService.getCurrentUser() && googleSignInRef.current) {
        authService.renderSignInButton(googleSignInRef.current);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const conversationId = await conversation.startSession({ 
        agentId: ELEVENLABS_AGENT_ID 
      });
      
      setConversationId(conversationId);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: 'Voice conversation started. You can now speak with the AI assistant.',
        type: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Permission Required",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
    setMessages([]);
    setIsTyping(false);
  };

  const toggleMute = async () => {
    const newVolume = isMuted ? 1 : 0;
    await conversation.setVolume({ volume: newVolume });
    setIsMuted(!isMuted);
  };

  const handleSignOut = () => {
    GoogleAuthService.getInstance().signOut();
    if (isConnected) {
      endConversation();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
        <Card className="p-8 w-full max-w-md text-center shadow-elevated">
          <div className="mb-6">
            <Bot className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Voice AI Assistant</h1>
            <p className="text-muted-foreground">
              Sign in with Google to start your voice conversation
            </p>
          </div>
          
          <div ref={googleSignInRef} className="flex justify-center"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chat-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 shadow-chat">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Voice AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Ready to connect'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-right text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isConnected && (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Ready to Chat</h3>
              <p className="text-muted-foreground">
                Click the microphone button below to start your voice conversation
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card
                className={`max-w-sm px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-user-message text-user-message-foreground'
                    : 'bg-bot-message text-bot-message-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>

              {message.type === 'user' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-bot-message text-bot-message-foreground px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-typing"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-typing" style={{animationDelay: '0.4s'}}></div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Controls */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                variant="voice"
                size="lg"
                onClick={startConversation}
                className="px-6 py-3 rounded-full"
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Voice Chat
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleMute}
                  className={`rounded-full ${isMuted ? 'text-voice-recording' : 'text-voice-active'}`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    conversation.isSpeaking 
                      ? 'bg-voice-active animate-voice-pulse shadow-voice' 
                      : 'bg-voice-inactive'
                  }`}>
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  {conversation.isSpeaking && (
                    <div className="absolute inset-0 rounded-full border-2 border-voice-active animate-ping"></div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={endConversation}
                  className="rounded-full text-destructive hover:text-destructive"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {isConnected && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {conversation.isSpeaking ? 'AI is speaking...' : 'Listening for your voice...'}
              </p>
              {conversationId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Session ID: {conversationId.slice(0, 8)}...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}