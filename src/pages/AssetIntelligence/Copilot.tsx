import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Lightbulb, Wrench, FileText, Clock, BarChart3, Settings, Users, Home, TrendingUp, AlertTriangle, Paperclip, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterBar } from "@/components/UI/FilterBar";
import { ExportButton } from "@/components/UI/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePendoConversation } from "@/hooks/usePendo";
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'query' | 'recommendation' | 'analysis' | 'report' | 'insight';
  attachments?: string[];
  userReaction?: 'positive' | 'negative' | 'mixed' | null;
}

// Enhanced chat history with role-specific responses
const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Why is Machine A showing error code E17?',
    timestamp: new Date(Date.now() - 600000),
    type: 'query'
  },
  {
    id: '2',
    role: 'assistant',
    content: `**Error Code E17 Analysis - Machine A (Centrifugal Pump)**

**Root Cause:** Pump output pressure below threshold (< 145 PSI, normal: 150-175 PSI)

**Likely Causes (ranked by probability):**
1. **Intake Filter Clog** (65% probability)
   - Last filter change: 45 days ago (due every 30 days)
   - Pressure differential: 8 PSI (normal: <3 PSI)

2. **Impeller Wear** (25% probability)
   - Asset age: 5.1 years
   - Recent vibration increase: 0.15 mm/s → 0.22 mm/s

3. **Seal Leak** (10% probability)
   - Minor fluid leak detected in last inspection

**Immediate Actions:**
🔧 Replace intake filter (Part #F-4421, ~30 min)
🔍 Inspect impeller for wear patterns
⚠️ Monitor seal condition during next PM

**If problem persists after filter replacement:**
📋 Schedule impeller inspection (2-hour downtime)
📞 Contact vendor for seal assessment`,
    timestamp: new Date(Date.now() - 580000),
    type: 'analysis',
    attachments: ['Error_Log_E17.pdf', 'Pump_Specs_A.pdf']
  }
];

const rolePersonas = {
  'Technician': {
    color: 'bg-blue-100 text-blue-800',
    icon: Wrench,
    description: 'Field maintenance and troubleshooting'
  },
  'Manager': {
    color: 'bg-green-100 text-green-800',
    icon: Users,
    description: 'Team oversight and resource planning'
  },
  'Planner': {
    color: 'bg-purple-100 text-purple-800',
    icon: BarChart3,
    description: 'Maintenance scheduling and logistics'
  }
};

// Quick action suggestions by role
const quickActionsByRole = {
  'Technician': [
    { icon: AlertTriangle, label: "Troubleshoot fault", query: "What's causing this error code?" },
    { icon: Wrench, label: "PM checklist", query: "Show me today's PM tasks for [ASSET]" },
    { icon: FileText, label: "Work instructions", query: "Find work instructions for [TASK]" },
    { icon: Settings, label: "Safety procedures", query: "What safety steps for [OPERATION]?" }
  ],
  'Manager': [
    { icon: TrendingUp, label: "Performance overview", query: "Show team performance metrics this week" },
    { icon: Users, label: "Resource allocation", query: "Which technicians are available today?" },
    { icon: AlertTriangle, label: "Critical alerts", query: "What are the high-priority issues?" },
    { icon: Settings, label: "Cost optimization", query: "Which 5 assets should we replace next year?" }
  ],
  'Planner': [
    { icon: BarChart3, label: "Schedule optimization", query: "When should I schedule downtime for [ASSET]?" },
    { icon: BarChart3, label: "Workload analysis", query: "Show technician availability and workload" },
    { icon: BarChart3, label: "Budget planning", query: "Project maintenance costs for Q4" },
    { icon: AlertTriangle, label: "Risk analysis", query: "Show critical assets requiring attention" }
  ]
};

export const Copilot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ persona: 'Technician' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Pendo Conversations API tracking
  const { trackPrompt, trackAgentResponse, trackUserReaction, resetConversation } = usePendoConversation();

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage("");
    resetConversation();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (overrideMessage?: string) => {
    const messageToSend = overrideMessage || inputMessage;
    if (!messageToSend.trim()) return;
    
    const userMessageId = `msg_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
      type: 'query'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Track user prompt with Pendo Conversations API
    trackPrompt(userMessageId, messageToSend, {
      modelUsed: 'gpt-4',
      suggestedPrompt: overrideMessage !== undefined,
      toolsUsed: [],
      fileUploaded: false,
    });
    
    // Simulate AI response based on role and query type
    setTimeout(() => {
      const assistantMessageId = `msg_${Date.now()}`;
      const responseContent = generateRoleBasedResponse(messageToSend, filters.persona || 'Technician');
      const responseType = determineResponseType(messageToSend);
      const toolsUsed = responseType === 'analysis' ? ['knowledge_base', 'diagnostics'] : ['knowledge_base'];
      
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: responseType,
        userReaction: null,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      // Track agent response with Pendo Conversations API
      trackAgentResponse(assistantMessageId, responseContent, {
        modelUsed: 'gpt-4',
        toolsUsed,
      });
    }, 2000);
  };

  const handleReaction = (messageId: string, reaction: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, userReaction: reaction } : msg
    ));
    
    // Track user reaction with Pendo Conversations API
    trackUserReaction(messageId, reaction, {
      modelUsed: 'gpt-4',
      toolsUsed: ['knowledge_base'],
    });
  };

  const generateRoleBasedResponse = (query: string, role: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (role === 'Technician') {
      if (lowerQuery.includes('error') || lowerQuery.includes('fault')) {
        return `**Troubleshooting Guide**

🔍 **Diagnostic Steps:**
1. Check system status indicators
2. Review recent alarm history
3. Verify sensor readings are within normal range
4. Inspect for visible damage or leaks

⚠️ **Safety First:**
• Ensure proper lockout/tagout procedures
• Wear required PPE (safety glasses, gloves)
• Verify area is clear of personnel

🔧 **Tools Required:**
• Multimeter for electrical testing
• Pressure gauges for hydraulic systems
• Basic hand tools (screwdrivers, wrenches)

📋 **Next Steps:**
1. Document all findings in CMMS
2. Order replacement parts if needed
3. Contact supervisor if issue persists

**Need specific part numbers or detailed procedures? Ask me about the exact asset and error code.**`;
      }
      
      if (lowerQuery.includes('pm') || lowerQuery.includes('maintenance')) {
        return `**Today's PM Schedule - Your Assignments**

🔧 **High Priority (Due Today):**
• Chiller Unit #3 - Quarterly inspection (2 hrs)
• Pump Station A - Monthly lubrication (30 min)
• Conveyor Belt #7 - Belt tension check (15 min)

⏰ **This Week:**
• Generator #2 - Annual service (scheduled Wednesday)
• HVAC Units 1-4 - Filter replacements (Thursday)

📋 **Materials Needed:**
• Oil type SAE 30 (5 liters)
• Air filters AF-442 (qty: 8)
• Belt tension gauge

**Tap any task above for detailed work instructions and safety procedures.**`;
      }
    }
    
    if (role === 'Manager') {
      return `**Team Performance Dashboard**

👥 **Team Status (Current Week):**
• Active Technicians: 12 of 15
• Completed Work Orders: 47 of 52
• Average Response Time: 23 minutes
• First-Time Fix Rate: 87%

🎯 **Key Metrics:**
• Unplanned Downtime: ↓ 15% vs last week
• PM Compliance: 94% (target: 95%)
• Cost per Work Order: $342 (budget: $375)

⚠️ **Attention Required:**
• 3 technicians on training (back Friday)
• High-priority repairs pending on Line 2
• Budget variance review needed for Q4

**Would you like to drill down into any specific area or schedule a team meeting?**`;
    }
    
    return `**Planning Analysis**

📊 **Resource Optimization:**
• Current capacity utilization: 78%
• Scheduled maintenance backlog: 14 days
• Emergency repairs this month: 8

📅 **Scheduling Recommendations:**
• Optimal downtime window: Next Tuesday 2-6 PM
• Cross-training opportunity: 3 technicians available
• Vendor coordination needed: HVAC annual service

**Next steps: Review scheduling conflicts and update maintenance calendar.**`;
  };

  const determineResponseType = (query: string): ChatMessage['type'] => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) return 'recommendation';
    if (lowerQuery.includes('analyze') || lowerQuery.includes('report')) return 'analysis';
    if (lowerQuery.includes('schedule') || lowerQuery.includes('plan')) return 'report';
    return 'insight';
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentQuickActions = quickActionsByRole[filters.persona as keyof typeof quickActionsByRole] || quickActionsByRole.Technician;
  const currentPersona = rolePersonas[filters.persona as keyof typeof rolePersonas] || rolePersonas.Technician;

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Copilot</h1>
            <p className="text-muted-foreground">GenAI assistant for maintenance technicians and planners</p>
          </div>
          
          <ExportButton 
            data={messages}
            filename="copilot-conversation"
            formats={['pdf', 'csv']}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]">
          {/* Quick Actions & Insights */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.query}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(rolePersonas).map(([role, persona]) => (
                    <Button
                      key={role}
                      variant={filters.persona === role ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setFilters({...filters, persona: role})}
                    >
                      <persona.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{role}</div>
                        <div className="text-xs text-muted-foreground">{persona.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 overflow-hidden">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="flex-none border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Maintenance AI</span>
                    </div>
                    <Badge className={currentPersona.color}>
                      <currentPersona.icon className="h-3 w-3 mr-1" />
                      {filters.persona} Mode
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetChat}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <div className="prose prose-sm max-w-none">
                              {message.content.split('\n').map((line, index) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return <h4 key={index} className="font-bold mt-2 mb-1">{line.slice(2, -2)}</h4>;
                                }
                                if (line.startsWith('🔧') || line.startsWith('⚠️') || line.startsWith('📋') || line.startsWith('🔍')) {
                                  return <h5 key={index} className="font-semibold mt-2 mb-1">{line}</h5>;
                                }
                                if (line.startsWith('•') || line.startsWith('-')) {
                                  return <li key={index} className="ml-4">{line.slice(1).trim()}</li>;
                                }
                                if (line.match(/^\d+\./)) {
                                  return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\./, '').trim()}</li>;
                                }
                                return line ? <p key={index}>{line}</p> : <br key={index} />;
                              })}
                            </div>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs opacity-70">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{attachment}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-between text-xs mt-2 ${
                              message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <div className="flex items-center">
                                {formatTime(message.timestamp)}
                                {message.type && message.type !== 'query' && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {message.type}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Reaction buttons for assistant messages */}
                              {message.role === 'assistant' && (
                                <div className="flex items-center gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${message.userReaction === 'positive' ? 'text-green-600 bg-green-100' : 'hover:text-green-600'}`}
                                    onClick={() => handleReaction(message.id, 'positive')}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${message.userReaction === 'negative' ? 'text-red-600 bg-red-100' : 'hover:text-red-600'}`}
                                    onClick={() => handleReaction(message.id, 'negative')}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Ask your maintenance AI assistant... (${filters.persona} mode)`}
                        className="resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};