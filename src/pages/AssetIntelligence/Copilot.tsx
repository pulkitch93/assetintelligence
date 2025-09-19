import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Lightbulb, Wrench, FileText, Clock, BarChart3, Settings, Users, Home, TrendingUp, AlertTriangle } from "lucide-react";
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'query' | 'recommendation' | 'analysis' | 'report' | 'insight';
  attachments?: string[];
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
🔧 **Step 1:** Check and replace intake filter
   - **Safety:** Lock out electrical supply
   - **Tools needed:** Filter wrench, new filter element
   - **Time:** 15 minutes
   - **Parts:** Filter P/N: GF-500-30 (3 available in inventory)

🔧 **Step 2:** If pressure remains low, inspect impeller
   - **Procedure:** SOP-PMP-003 (Impeller Inspection)
   - **Time:** 45 minutes
   - **Specialist required:** Level 2 Mechanical Tech

📋 **Documentation:** Log findings in CMMS Work Order #WO-25-8834

**Parts Availability:**
✅ Intake Filter (3 in stock) - $85
⚠️ Impeller Assembly - Not in stock
   - **Lead Time:** 5-7 days from Grundfos
   - **Cost:** $850
   - **Suggested Action:** Order now as backup`,
    timestamp: new Date(Date.now() - 580000),
    type: 'analysis',
    attachments: ['SOP-PMP-003.pdf', 'Parts_Catalog_Grundfos.pdf']
  },
  {
    id: '3',
    role: 'user',
    content: 'Show me maintenance performance for Plant A over last 6 months',
    timestamp: new Date(Date.now() - 400000),
    type: 'query'
  },
  {
    id: '4',
    role: 'assistant',
    content: `**Plant A Maintenance Performance Summary (March - September 2025)**

📊 **Key Metrics:**
• **Downtime:** 127 hours (↑15% vs. previous 6 months)
• **PM Compliance:** 92% (↓3% vs. target of 95%)
• **Reactive Maintenance:** 28% of total work (↑8% - above recommended 15%)
• **MTTR:** 4.2 hours (↑0.8 hours)
• **Work Order Completion:** 89% on-time

📈 **Trend Analysis:**
**Downtime by Month:**
• March: 18 hours
• April: 15 hours  
• May: 25 hours ⚠️
• June: 22 hours
• July: 28 hours ⚠️
• August: 19 hours
• September: 20 hours

**Primary Drivers of Increased Downtime:**
1. **Motor Failures** (35% of downtime)
   - Assets affected: Pump-003, Compressor-007, Fan-012
   - **Root cause:** Bearing degradation due to high ambient temperatures
   - **Recommendation:** Increase cooling system maintenance

2. **Unplanned HVAC Issues** (25% of downtime)
   - Chiller-001: 18-hour emergency repair (May)
   - **Impact:** Production line shutdown, $45K lost revenue
   - **Action taken:** Upgraded to Prescriptive Maintenance monitoring

3. **Control System Faults** (20% of downtime)
   - Legacy PLC systems showing increased failure rates
   - **Recommendation:** Phase replacement over next 12 months

💡 **Key Recommendations:**
1. **Immediate:** Schedule overdue PM on Pump-003 and Compressor-007
2. **Short-term:** Increase vibration monitoring frequency on critical motors
3. **Long-term:** Implement condition-based maintenance for aging assets

**Cost Impact:**
• Maintenance costs: $125K (within budget)
• Lost production value: $89K (↑45%)
• **ROI Opportunity:** Estimated $65K annual savings with improved PM compliance`,
    timestamp: new Date(Date.now() - 380000),
    type: 'report'
  }
];

// Role-specific quick actions
const quickActionsByRole = {
  'Technician': [
    { icon: AlertTriangle, label: "Error code troubleshooting", query: "Why is [ASSET] showing error code [CODE]?" },
    { icon: Wrench, label: "Step-by-step repair guidance", query: "Walk me through replacing [COMPONENT] on [ASSET]" },
    { icon: FileText, label: "Find SOP/Manual", query: "Show me the SOP for [TASK]" },
    { icon: Clock, label: "Today's PM tasks", query: "What preventive maintenance is due today?" }
  ],
  'Manager': [
    { icon: BarChart3, label: "Performance summary", query: "Show me maintenance KPIs for [TIMEFRAME]" },
    { icon: TrendingUp, label: "Asset predictions", query: "Which assets are likely to fail in next 30 days?" },
    { icon: Users, label: "Resource planning", query: "What's the optimal maintenance schedule for next month?" },
    { icon: Settings, label: "Cost optimization", query: "Which 5 assets should we replace next year?" }
  ],
  'Planner': [
    { icon: BarChart3, label: "Schedule optimization", query: "When should I schedule downtime for [ASSET]?" },
    { icon: BarChart3, label: "Workload analysis", query: "Show technician availability and workload" },
    { icon: BarChart3, label: "Budget planning", query: "Project maintenance costs for Q4" },
    { icon: AlertTriangle, label: "Risk analysis", query: "Show critical assets requiring attention" }
  ]
};

const filterOptions = [
  {
    key: "persona",
    label: "User Role",
    type: "select" as const,
    options: ["Technician", "Manager", "Planner", "Engineer"]
  },
  {
    key: "focus_area",
    label: "Focus Area", 
    type: "select" as const,
    options: ["Troubleshooting", "Performance Analysis", "Cost Optimization", "Risk Management", "Scheduling"]
  }
];

export const Copilot = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({ persona: "Technician" });
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: 'query'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response based on role and query type
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateRoleBasedResponse(message, filters.persona || 'Technician'),
        timestamp: new Date(),
        type: determineResponseType(message)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
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
• **Chiller-001**: Quarterly inspection (Est. 3 hours)
  - Filter replacement
  - Refrigerant level check
  - Electrical connections inspection

• **Pump-005**: Monthly lubrication (Est. 1 hour)
  - Bearing lubrication
  - Coupling alignment check

📅 **This Week:**
• Generator load bank test (Wednesday, 4 hours)
• Compressor belt inspection (Friday, 2 hours)

**Parts Pre-staged:**
✅ Filters (Rack B-12)
✅ Lubricants (Tool room)
⚠️ Generator test load bank (Coordinate with Facilities)

**Questions? Need safety procedures or part locations? Just ask!**`;
      }
    }
    
    if (role === 'Manager') {
      if (lowerQuery.includes('performance') || lowerQuery.includes('kpi')) {
        return `**Maintenance Performance Dashboard - Current Month**

📊 **Key Performance Indicators:**
• **Overall Equipment Effectiveness (OEE):** 78% (Target: 85%)
• **Planned vs Reactive Maintenance:** 72:28 (Target: 85:15)
• **PM Compliance:** 91% (Target: 95%)
• **MTBF:** 342 hours (↑12% vs last month)
• **Work Order Completion Rate:** 87% on-time

⚠️ **Areas Requiring Attention:**
1. **Reactive Maintenance High** (28% vs 15% target)
   - Root cause: Delayed PM on aging assets
   - **Action:** Implement condition monitoring on 5 critical assets

2. **OEE Below Target** (78% vs 85%)
   - Primary driver: Unplanned downtime
   - **Impact:** $125K lost production value this month

💡 **Strategic Recommendations:**
• **Short-term:** Increase PM frequency on assets >8 years old
• **Medium-term:** Invest in predictive maintenance technology ($85K, 14-month payback)
• **Long-term:** Phase replacement of bottom 10% performing assets

**Benchmark Comparison:**
Your facility ranks in 65th percentile vs industry peers. Top quartile facilities achieve 90%+ PM compliance.

**Budget Impact:** Current trajectory suggests $45K budget overrun in Q4 without intervention.`;
      }
      
      if (lowerQuery.includes('predict') || lowerQuery.includes('fail')) {
        return `**30-Day Failure Risk Forecast**

🚨 **High Risk Assets (>80% failure probability):**
1. **HVAC-Chiller-001** (89% risk)
   - **Failure window:** 7-14 days
   - **Impact:** $15K/day production loss
   - **Recommendation:** Schedule emergency maintenance this weekend

2. **Pump-Water-007** (82% risk)
   - **Failure window:** 2-3 weeks
   - **Impact:** Secondary cooling system offline
   - **Recommendation:** Order replacement pump now (5-day lead time)

⚠️ **Medium Risk Assets (50-80% risk):**
• Generator-002 (67% risk) - Schedule load test
• Compressor-005 (58% risk) - Vibration analysis recommended

💰 **Financial Impact Avoidance:**
• **Proactive intervention cost:** $12K
• **Reactive failure cost (estimated):** $89K
• **Net savings:** $77K

🎯 **Recommended Actions:**
1. **Immediate:** Authorize emergency PM budget ($12K)
2. **This week:** Meet with operations to schedule downtime windows
3. **Next month:** Review and adjust PM frequencies based on risk scores

**Need detailed maintenance plans or want to simulate different scenarios?**`;
      }
    }
    
    if (role === 'Planner') {
      if (lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
        return `**Optimal Maintenance Scheduling - Next 30 Days**

📅 **Recommended Schedule:**

**Week 1 (Sept 23-29):**
• **Monday:** Routine PM tasks (3 technicians, 8 hours)
• **Wednesday:** Chiller-001 emergency maintenance (2 specialists, 6 hours)
  - **Best window:** 6 AM - 12 PM (low production demand)
  - **Resource:** HVAC specialist + apprentice
• **Friday:** Generator load testing (1 technician, 4 hours)

**Week 2 (Sept 30 - Oct 6):**
• **Tuesday:** Pump replacement - Water-007 (3 technicians, 8 hours)
  - **Parts arrival:** Monday Sept 30
  - **Production impact:** Minimal (backup system available)

**Week 3-4:** Focus on quarterly inspections (12 assets scheduled)

🔧 **Resource Optimization:**
• **Current utilization:** 78% (optimal: 80-85%)
• **Skills gaps:** Need 1 additional electrical specialist
• **Overtime projection:** 15 hours (within budget)

📊 **Scheduling Constraints:**
• Production schedule: High demand Tues-Thurs
• **Optimal maintenance windows:** Weekends, early mornings
• **Emergency slots:** Wednesday 2-6 PM reserved

💡 **Efficiency Improvements:**
1. **Batch similar tasks** - Save 12% travel time
2. **Pre-stage materials** - Reduce job time by 15%
3. **Cross-train technicians** - Improve flexibility

**Want me to adjust for specific constraints or simulate different scenarios?**`;
      }
    }

    // Default response
    return `I understand you're asking about "${query}". Based on your role as ${role}, I can help you with:

**Immediate Actions:**
• Asset risk analysis and recommendations
• Maintenance scheduling and resource planning  
• Performance benchmarking and KPI tracking
• Cost optimization opportunities

**Long-term Planning:**
• Capital replacement strategies
• Predictive maintenance implementation
• Workforce development and training needs
• Budget forecasting and scenario planning

**Could you be more specific about:**
- Which assets or systems you're interested in?
- What time frame you're planning for?
- Any specific performance metrics or concerns?

I have access to your complete asset database, maintenance history, and industry benchmarks to provide targeted recommendations.`;
  };

  const determineResponseType = (query: string): 'recommendation' | 'analysis' | 'report' | 'insight' => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('show') || lowerQuery.includes('report')) return 'report';
    if (lowerQuery.includes('why') || lowerQuery.includes('analyze')) return 'analysis';
    if (lowerQuery.includes('recommend') || lowerQuery.includes('should')) return 'recommendation';
    return 'insight';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickAction = (query: string) => {
    setInputMessage(query.replace('[ASSET]', 'Chiller-001').replace('[CODE]', 'E17').replace('[COMPONENT]', 'pump impeller').replace('[TASK]', 'bearing replacement').replace('[TIMEFRAME]', 'last 6 months'));
  };

  const currentQuickActions = quickActionsByRole[filters.persona as keyof typeof quickActionsByRole] || quickActionsByRole['Technician'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/asset-intelligence')}
            className="mr-4"
          >
            <Home size={20} className="mr-2" />
            Asset Intelligence
          </Button>
          
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">AI Copilot</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <FilterBar 
          filters={filterOptions}
          onFiltersChange={setFilters}
          searchPlaceholder="Search conversation history..."
        />
        
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Copilot</h1>
              <p className="text-muted-foreground">
                {filters.persona === 'Technician' && "Real-time troubleshooting and step-by-step maintenance guidance"}
                {filters.persona === 'Manager' && "Strategic insights, performance analysis, and decision support"}
                {filters.persona === 'Planner' && "Scheduling optimization, resource planning, and workflow management"}
                {!['Technician', 'Manager', 'Planner'].includes(filters.persona) && "GenAI assistant for maintenance operations"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filters.persona || "Technician"} Mode</Badge>
              <ExportButton 
                data={messages}
                filename="copilot-conversation"
                formats={['pdf', 'csv']}
              />
            </div>
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
                      <action.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Proactive Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proactive Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-destructive-light rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Critical Alert</p>
                        <p className="text-xs text-muted-foreground">Chiller-001 risk increased to 89%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-warning-light rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">PM Overdue</p>
                        <p className="text-xs text-muted-foreground">3 assets need attention</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-success-light rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-success">Efficiency Gain</p>
                        <p className="text-xs text-muted-foreground">MTBF improved 12%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    Error Code E17 Analysis
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs"> 
                    Plant A Performance Review
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    Pump Bearing Replacement
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    Q4 Budget Planning
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5" />
                    Asset Intelligence Assistant
                    <Badge variant="secondary" className="ml-2">{filters.persona}</Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {message.role === 'assistant' && (
                                <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              )}
                              {message.role === 'user' && (
                                <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment, index) => (
                                      <div key={index} className="flex items-center space-x-2 text-xs opacity-70">
                                        <FileText className="h-3 w-3" />
                                        <span>{attachment}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className={`text-xs mt-2 ${
                                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {formatTime(message.timestamp)}
                                  {message.type && message.type !== 'query' && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {message.type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                            <div className="flex items-center space-x-3">
                              <Bot className="h-5 w-5" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Textarea
                          placeholder={
                            filters.persona === 'Technician' 
                              ? "Ask me about error codes, repair procedures, SOPs, or maintenance tasks..."
                              : filters.persona === 'Manager'
                              ? "Ask me about KPIs, performance trends, resource planning, or strategic recommendations..."
                              : filters.persona === 'Planner'
                              ? "Ask me about scheduling, resource optimization, workload planning, or cost analysis..."
                              : "Ask me about asset risks, maintenance schedules, SOPs, or anything else..."
                          }
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(inputMessage);
                            }
                          }}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <Button
                        onClick={() => handleSendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isLoading}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Press Enter to send, Shift+Enter for new line</span>
                      <span>Powered by Asset Intelligence AI • {filters.persona} Mode</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};