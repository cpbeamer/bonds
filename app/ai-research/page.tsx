'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, Trash2, Plus } from 'lucide-react'

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
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900">
        <div className="flex w-full">
          {/* Left Sidebar - Chat History */}
          <div className="w-64 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-600 flex flex-col">
            {/* New Chat Button */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-600">
              <Button
                onClick={createNewChat}
                className="w-full justify-start gap-2 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600"
              >
                <Plus className="w-4 h-4" />
                New chat
              </Button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {chatSessions.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                  <p className="text-sm">No previous conversations</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-neutral-200 dark:bg-neutral-700'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <Bot className="w-4 h-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-neutral-900 dark:text-neutral-100">
                          {session.title}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >
              {!currentSession || currentSession.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-normal text-neutral-900 dark:text-neutral-100 mb-2">
                      Good evening, {user?.firstName || 'there'}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      How can I help you with bond research today?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    <div
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => {
                        setCurrentMessage("What are the current market trends in municipal bonds?")
                        setTimeout(() => sendMessage(), 100)
                      }}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        Market Analysis
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Current trends and opportunities
                      </div>
                    </div>
                    <div
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => {
                        setCurrentMessage("How do I assess credit risk for municipal bonds?")
                        setTimeout(() => sendMessage(), 100)
                      }}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        Risk Assessment
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Credit analysis and evaluation
                      </div>
                    </div>
                    <div
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => {
                        setCurrentMessage("What yield strategies work best for high income earners?")
                        setTimeout(() => sendMessage(), 100)
                      }}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        Yield Strategies
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Tax-efficient income planning
                      </div>
                    </div>
                    <div
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => {
                        setCurrentMessage("How should I diversify my bond portfolio?")
                        setTimeout(() => sendMessage(), 100)
                      }}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        Portfolio Planning
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Diversification and allocation
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 max-w-4xl mx-auto ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col max-w-[75%]">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      </div>
                      <div className={`text-xs text-neutral-500 dark:text-neutral-400 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{user?.firstName?.[0] || 'U'}</span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isAITyping && (
                <div className="flex gap-4 max-w-4xl mx-auto">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-6 pb-6">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <Input
                    placeholder="Message BondScout..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-4 pr-12 py-3 text-base bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400"
                    disabled={isAITyping}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isAITyping}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-8 w-8 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}