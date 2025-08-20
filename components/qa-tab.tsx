"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, User, Bot, HelpCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { DocumentAPI, QAResponse, SuggestedQuestionsResponse } from "@/lib/api"
import { useAppContext } from "@/lib/context"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  confidence?: number;
  citations?: any[];
  relatedTopics?: string[];
  followUpQuestions?: string[];
  processingTime?: number;
  isLoading?: boolean;
}

// Enhanced markdown components for ChatGPT-style formatting
const MarkdownComponents = {
  // Enhanced paragraph styling with better spacing
  p: ({ children, ...props }: any) => (
    <p className="mb-4 leading-relaxed text-sm text-gray-800 dark:text-gray-200" {...props}>{children}</p>
  ),
  
  // Enhanced heading styles with better hierarchy
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-bold mb-2 mt-4 first:mt-0 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </h4>
  ),
  
  // Enhanced list styles with better spacing and bullets
  ul: ({ children, ...props }: any) => (
    <ul className="mb-4 ml-6 space-y-2 list-disc marker:text-gray-600 dark:marker:text-gray-400" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mb-4 ml-6 space-y-2 list-decimal marker:text-gray-600 dark:marker:text-gray-400" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 pl-1" {...props}>
      {children}
    </li>
  ),
  
  // Enhanced bold styling with better contrast
  strong: ({ children, ...props }: any) => (
    <strong className="font-bold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </strong>
  ),
  
  // Enhanced italic styling
  em: ({ children, ...props }: any) => (
    <em className="italic text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </em>
  ),
  
  // Enhanced blockquote with ChatGPT-style appearance
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300 rounded-r-md" {...props}>
      {children}
    </blockquote>
  ),
  
  // Enhanced code styling with syntax highlighting appearance
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-xs font-mono border" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto border" {...props}>
        <code className="text-sm font-mono">{children}</code>
      </pre>
    );
  },
  
  // Enhanced table styling with ChatGPT-like appearance
  table: ({ children, ...props }: any) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </td>
  ),
  
  // Enhanced horizontal rule
  hr: ({ ...props }: any) => (
    <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
  ),
  
  // Add support for strikethrough
  del: ({ children, ...props }: any) => (
    <del className="line-through text-gray-500 dark:text-gray-400" {...props}>
      {children}
    </del>
  ),
  
  // Enhanced link styling
  a: ({ children, ...props }: any) => (
    <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" {...props}>
      {children}
    </a>
  ),
}

export function QATab() {
  const { state } = useAppContext()
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('qa_conversation_history')
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages)
          // Only load if we have a valid conversation (max 50 messages to prevent overflow)
          if (Array.isArray(parsed) && parsed.length <= 50) {
            return parsed
          }
        } catch (e) {
          console.warn('Failed to parse saved conversation:', e)
        }
      }
    }
    return []
  })
  const [newMessage, setNewMessage] = useState("")
  const [isAsking, setIsAsking] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const quickTopics = [
    "Termination Conditions",
    "Liability Limitations", 
    "Intellectual Property Rights",
    "Dispute Resolution",
    "Confidentiality Clauses",
    "Payment Terms",
  ]

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      // Keep only the last 20 messages to prevent localStorage from getting too large
      const messagesToSave = messages.slice(-20)
      localStorage.setItem('qa_conversation_history', JSON.stringify(messagesToSave))
    }
  }, [messages])

  // Load suggested questions when document is available
  useEffect(() => {
    if (state.currentDocument?.id) {
      loadSuggestedQuestions()
    }
  }, [state.currentDocument?.id])

  const loadSuggestedQuestions = async () => {
    if (!state.currentDocument?.id) return
    
    setIsLoadingSuggestions(true)
    try {
      const response = await DocumentAPI.getSuggestedQuestions(state.currentDocument.id)
      if (response.status === "success" && response.data?.suggested_questions) {
        setSuggestedQuestions(response.data.suggested_questions)
      }
    } catch (error) {
      console.error("Failed to load suggested questions:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isAsking) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: newMessage,
      timestamp: "Just now",
    }

    // Add user message
    setMessages((prev) => [...prev, userMessage])
    
    // Add loading AI message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: "ai",
      content: "Analyzing your question...",
      timestamp: "Just now",
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    const query = newMessage
    setNewMessage("")
    setIsAsking(true)

    try {
      // Get conversation context for continuity
      const conversationContext = getConversationContext()
      
      console.log("🔍 Q&A Debug Info:");
      console.log("📄 Document ID:", state.currentDocument?.id);
      console.log("💬 Query:", query);
      console.log("📚 Conversation Context:", conversationContext);
      
      const response = await DocumentAPI.askQuestion(
        query, 
        state.currentDocument?.id,
        conversationContext
      )
      
      if (response.status === "success" && response.data) {
        const qaData = response.data
        
        const aiMessage: Message = {
          id: Date.now() + 2,
          type: "ai",
          content: qaData.answer,
          timestamp: "Just now",
          confidence: qaData.confidence_score,
          citations: qaData.citations,
          relatedTopics: qaData.related_topics,
          followUpQuestions: qaData.follow_up_questions,
          processingTime: qaData.processing_time,
          isLoading: false,
        }
        
        // Replace loading message with actual response
        setMessages((prev) => prev.slice(0, -1).concat(aiMessage))
      } else {
        // Handle error
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: "ai",
          content: "I apologize, but I encountered an error processing your question. Please try again or rephrase your question.",
          timestamp: "Just now",
          confidence: 0,
          isLoading: false,
        }
        setMessages((prev) => prev.slice(0, -1).concat(errorMessage))
      }
    } catch (error) {
      console.error("Error asking question:", error)
      const errorMessage: Message = {
        id: Date.now() + 2,
        type: "ai",
        content: "I'm sorry, but I'm having trouble connecting to the analysis service. Please check your connection and try again.",
        timestamp: "Just now",
        confidence: 0,
        isLoading: false,
      }
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage))
    } finally {
      setIsAsking(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    setNewMessage(question)
  }

  const clearConversation = () => {
    setMessages([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qa_conversation_history')
    }
  }

  const getConversationContext = () => {
    // Get last 3 conversation pairs for context
    const recentMessages = messages.slice(-6) // Last 6 messages = 3 conversation pairs
    return recentMessages.map(msg => `${msg.type}: ${msg.content}`).join('\n')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-space-grotesk">Document Q&A</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions about this contract and get AI-powered answers.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  state.currentDocument?.id ? "bg-green-500" : "bg-yellow-500"
                }`}></div>
                <span className="text-muted-foreground">
                  {state.currentDocument?.id 
                    ? "Q&A Ready" 
                    : "Upload document for Q&A"
                  }
                </span>
              </div>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  Clear History
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-space-grotesk">Interactive Document Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use our AI chatbot to ask specific questions about this document. Get instant answers about clauses,
                risks, obligations, and legal implications.
              </p>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${message.type === "user" ? "justify-end" : ""}`}
                  >
                    {message.type === "ai" && (
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {message.isLoading ? (
                          <Clock className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-2xl p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {/* Render AI messages with enhanced markdown, user messages as plain text */}
                      {message.type === "ai" ? (
                        <div className="prose prose-sm max-w-none text-secondary-foreground overflow-hidden whitespace-pre-wrap break-words">
                          <ReactMarkdown 
                            components={MarkdownComponents}
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                      
                      {/* Enhanced AI message info */}
                      {message.type === "ai" && !message.isLoading && (
                        <div className="mt-3 space-y-2">
                          {/* Confidence and processing time */}
                          {message.confidence !== undefined && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                {message.confidence >= 80 ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : message.confidence >= 60 ? (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span>Confidence: {message.confidence.toFixed(1)}%</span>
                              </div>
                              {message.processingTime && (
                                <span>{message.processingTime.toFixed(2)}s</span>
                              )}
                            </div>
                          )}
                          
                          {/* Citations */}
                          {message.citations && message.citations.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-muted-foreground mb-1">Sources:</p>
                              <div className="space-y-1">
                                {message.citations.slice(0, 2).map((citation, idx) => (
                                  <div key={idx} className="bg-background/50 p-2 rounded text-xs">
                                    <div className="font-medium">{citation.source}</div>
                                    <div className="text-muted-foreground truncate">
                                      {citation.preview}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Related topics */}
                          {message.relatedTopics && message.relatedTopics.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-muted-foreground mb-1">Related:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.relatedTopics.slice(0, 3).map((topic, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p
                        className={`text-xs mt-2 ${
                          message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder={
                    state.currentDocument 
                      ? "Ask a question about this document..." 
                      : "Please upload a document first..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={!state.currentDocument || isAsking}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={!state.currentDocument || isAsking || !newMessage.trim()}
                >
                  {isAsking ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Status indicator */}
              {!state.currentDocument && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Upload and analyze a document to start asking questions
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Topics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-space-grotesk">Quick Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleQuestionClick(`Tell me about ${topic.toLowerCase()}`)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-space-grotesk">
                Suggested Questions
                {isLoadingSuggestions && (
                  <Clock className="inline h-4 w-4 ml-2 animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedQuestions.length > 0 ? (
                  suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-secondary"
                      onClick={() => handleQuestionClick(question)}
                      disabled={isAsking || !state.currentDocument}
                    >
                      <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))
                ) : !isLoadingSuggestions && state.currentDocument ? (
                  <p className="text-sm text-muted-foreground">
                    No suggested questions available for this document.
                  </p>
                ) : !state.currentDocument ? (
                  <p className="text-sm text-muted-foreground">
                    Upload a document to see suggested questions.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
