'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, Trash2, MoreHorizontal } from 'lucide-react'
import { theme } from '@/lib/themes'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  lastActivity: Date
}

export default function AIResearchPage() {
  const { user } = useUser()
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  const currentSession = chatSessions.find(session => session.id === currentSessionId)

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [currentSession?.messages, isAITyping])

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastActivity: new Date()
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
  }

  const deleteChat = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId))
    if (currentSessionId === sessionId) {
      const remaining = chatSessions.filter(session => session.id !== sessionId)
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    let sessionId = currentSessionId
    if (!sessionId) {
      createNewChat()
      sessionId = Date.now().toString()
      setCurrentSessionId(sessionId)
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setCurrentMessage('')
    setChatSessions(prev => prev.map(session =>
      session.id === sessionId
        ? {
            ...session,
            messages: [...session.messages, userMessage],
            title: session.messages.length === 0 ? userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : '') : session.title,
            lastActivity: new Date()
          }
        : session
    ))
    setIsAITyping(true)

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      }

      setChatSessions(prev => prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, aiResponse],
              lastActivity: new Date()
            }
          : session
      ))
      setIsAITyping(false)
    }, 1500)
  }

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm your AI bond research assistant. I can help you with:

• **Bond Analysis**: Detailed research on specific bonds or issuers
• **Market Insights**: Current trends and conditions in the municipal bond market
• **Risk Assessment**: Credit analysis and risk factors for different bonds
• **Yield Strategies**: Optimization for your tax situation and goals
• **Portfolio Planning**: Asset allocation and diversification strategies

What would you like to explore today?`
    }

    if (lowerMessage.includes('best') || lowerMessage.includes('recommend')) {
      return `For personalized bond recommendations, I'll need to understand your specific criteria:

**Investment Goals:**
• Income generation vs. capital preservation
• Risk tolerance (conservative, moderate, aggressive)
• Time horizon for your investments

**Tax Considerations:**
• Your tax bracket and state of residence
• Preference for tax-free municipal bonds
• AMT (Alternative Minimum Tax) concerns

**Portfolio Context:**
• Current holdings and diversification needs
• Liquidity requirements
• Credit quality preferences

Would you like to share any of these details so I can provide more targeted recommendations?`
    }

    if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
      return `Municipal bond risks can be categorized into several key areas:

**Credit Risk:**
• General Obligation bonds (backed by taxing power) vs. Revenue bonds
• Rating agencies: Moody's, S&P, Fitch ratings
• Underlying economic health of the issuer

**Interest Rate Risk:**
• Bond prices move inversely to interest rates
• Duration measures price sensitivity to rate changes
• Call provisions can limit upside in falling rate environments

**Liquidity Risk:**
• Municipal bonds trade less frequently than corporate bonds
• Smaller issues may have wider bid-ask spreads
• Consider this for bonds you may need to sell before maturity

**Inflation Risk:**
• Fixed coupon payments lose purchasing power over time
• TIPS (Treasury Inflation-Protected Securities) as alternative

Would you like me to dive deeper into any of these risk categories?`
    }

    if (lowerMessage.includes('yield') || lowerMessage.includes('income')) {
      return `Municipal bond yields offer unique tax advantages:

**Tax-Equivalent Yield Calculation:**
• Municipal yield ÷ (1 - tax rate) = Tax-equivalent yield
• For high earners, this often exceeds Treasury yields
• State-specific bonds may offer additional state tax exemption

**Current Market Environment:**
• 10-year Treasury: ~4.25%
• AAA Municipal: ~3.95% (68.5% of Treasury)
• Investment grade corporate: ~4.85%

**Yield Curve Considerations:**
• Shorter maturities: 2-5 years for stability
• Longer maturities: 10+ years for higher yields
• Ladder strategies: Spread maturities for consistent income

**Quality vs. Yield Trade-offs:**
• AAA/AA: Lower yield, highest safety
• A/BBB: Moderate yield increase, acceptable risk
• High-yield munis: Significant yield premium, higher risk

What's your target yield range and risk comfort level?`
    }

    return `I'm here to help with your bond research! I can assist with:

**Market Analysis:**
• Current interest rate environment and trends
• Credit spreads and relative value opportunities
• Sector-specific insights (healthcare, education, utilities, etc.)

**Bond Evaluation:**
• Credit analysis methodologies
• Yield calculations and tax implications
• Call provisions and structural features

**Portfolio Strategy:**
• Asset allocation recommendations
• Diversification across states, sectors, and maturities
• Laddering vs. barbell strategies

**Research Tools:**
• How to read official statements
• Key financial ratios for municipal issuers
• Resources for ongoing credit monitoring

What specific area would you like to explore? Feel free to ask about particular bonds, market conditions, or investment strategies.`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-transparent dark:to-transparent dark:bg-background">
      <main className={`${theme.layout.container.margin} ${theme.layout.container.padding} ${theme.layout.page.padding}`}>
        <div className="flex h-[calc(100vh-120px)] gap-6">
          {/* Chat History Sidebar */}
          <div className="w-80 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chat History</CardTitle>
                  <Button onClick={createNewChat} size="sm">
                    <Bot className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {chatSessions.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs">Start a new conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chatSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                            currentSessionId === session.id ? 'bg-orange-50 dark:bg-orange-900/20 border-l-2 border-l-orange-600' : ''
                          }`}
                          onClick={() => setCurrentSessionId(session.id)}
                        >
                          <Bot className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {session.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(session.lastActivity)} · {session.messages.length} messages
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteChat(session.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6 text-orange-600" />
                  <div>
                    <CardTitle>AI Bond Research Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Get expert insights on municipal bonds, market analysis, and investment strategies
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 flex flex-col p-0">
                <div
                  ref={chatMessagesRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                  {!currentSession || currentSession.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to AI Bond Research</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        I'm your AI assistant specialized in municipal bond analysis. Ask me anything about bonds, market conditions, or investment strategies.
                      </p>
                      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">Market Analysis</div>
                          <div className="text-xs text-orange-700 dark:text-orange-400">Current trends and opportunities</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">Risk Assessment</div>
                          <div className="text-xs text-orange-700 dark:text-orange-400">Credit analysis and evaluation</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">Yield Strategies</div>
                          <div className="text-xs text-orange-700 dark:text-orange-400">Tax-efficient income planning</div>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">Portfolio Planning</div>
                          <div className="text-xs text-orange-700 dark:text-orange-400">Diversification and allocation</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    currentSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[80%]">
                          <div
                            className={`p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-orange-600 text-white ml-auto'
                                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                          <div className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium">{user?.firstName?.[0] || 'U'}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isAITyping && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t p-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Ask about bonds, market analysis, investment strategies..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={isAITyping}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isAITyping}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}