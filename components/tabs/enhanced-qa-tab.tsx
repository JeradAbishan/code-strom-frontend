"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Send, User, Bot, HelpCircle, ExternalLink, FileText, Clock, AlertCircle } from "lucide-react"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: string
  confidence?: number
  sources?: Array<{
    id: number
    content_preview: string
    similarity_score: number
    source: string
  }>
  related_topics?: string[]
  follow_up_questions?: string[]
  processing_time?: number
}

interface QATabProps {
  documentId?: string
}

interface RagHealth {
  rag_health?: {
    status: 'healthy' | 'partial' | 'unhealthy' | 'unknown'
  }
  capabilities?: {
    question_answering: boolean
    semantic_search: boolean
    document_citation: boolean
  }
}

export function QATab({ documentId }: QATabProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [ragHealth, setRagHealth] = useState<RagHealth | null>(null)

  const quickTopics = [
    "Termination Conditions",
    "Liability Limitations",
    "Intellectual Property Rights",
    "Dispute Resolution",
    "Confidentiality Clauses",
    "Payment Terms",
  ]

  const loadSuggestedQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (documentId) {
        params.append('document_id', documentId)
      }
      
      const response = await fetch(`http://localhost:8000/suggested_questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestedQuestions(data.suggested_questions || [])
      }
    } catch (error) {
      console.error('Failed to load suggested questions:', error)
      // Fallback to default questions
      setSuggestedQuestions([
        "What are the key obligations for each party?",
        "What are the termination conditions?",
        "How are disputes resolved?",
        "What are the liability limitations?",
        "What intellectual property rights are involved?",
        "What are the payment terms and conditions?"
      ])
    }
  }, [documentId])

  // Load suggested questions and check RAG health on component mount
  useEffect(() => {
    loadSuggestedQuestions()
    checkRagHealth()
  }, [documentId, loadSuggestedQuestions])

  const checkRagHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/rag_health')
      if (response.ok) {
        const data = await response.json()
        setRagHealth(data)
      }
    } catch (error) {
      console.error('Failed to check RAG health:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: newMessage,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)

    try {
      // Call RAG API
      const params = new URLSearchParams({
        query: newMessage.trim()
      })
      
      if (documentId) {
        params.append('document_id', documentId)
      }

      const response = await fetch(`http://localhost:8000/ask_question?${params}`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: data.answer,
          timestamp: "Just now",
          confidence: data.confidence_score,
          sources: data.citations,
          related_topics: data.related_topics,
          follow_up_questions: data.follow_up_questions,
          processing_time: data.processing_time
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: `I apologize, but I encountered an error: ${errorData.detail}. Please try again or rephrase your question.`,
          timestamp: "Just now",
          confidence: 0
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: "I'm sorry, I'm having trouble connecting to the analysis service. Please check your connection and try again.",
        timestamp: "Just now",
        confidence: 0
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    setNewMessage(question)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600"
      case "partial": return "text-yellow-600"
      default: return "text-red-600"
    }
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
                Ask questions about this contract and get AI-powered answers with source citations.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {ragHealth && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    ragHealth.rag_health?.status === 'healthy' ? 'bg-green-500' : 
                    ragHealth.rag_health?.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-muted-foreground">
                    RAG Service: <span className={getHealthStatusColor(ragHealth.rag_health?.status || 'unknown')}>
                      {ragHealth.rag_health?.status || 'unknown'}
                    </span>
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Documentation
              </Button>
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
                Ask specific questions about this document. Get instant AI-powered answers with confidence scores and source citations.
              </p>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-6 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ask me anything about this legal document!</p>
                    <p className="text-sm mt-2">Try one of the suggested questions below to get started.</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    <div
                      className={`flex items-start space-x-3 ${message.type === "user" ? "justify-end" : ""}`}
                    >
                      {message.type === "ai" && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-md p-4 rounded-lg ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* AI message metadata */}
                        {message.type === "ai" && (
                          <div className="mt-3 space-y-2">
                            {message.confidence !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Confidence:</span>
                                <span className={`text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                                  {message.confidence.toFixed(1)}%
                                </span>
                                <Progress value={message.confidence} className="h-1 w-16" />
                              </div>
                            )}
                            
                            {message.processing_time && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{message.processing_time.toFixed(2)}s</span>
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

                    {/* AI message additional info */}
                    {message.type === "ai" && (message.sources || message.related_topics || message.follow_up_questions) && (
                      <div className="ml-11 space-y-3">
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <Card className="border-border/50">
                            <CardContent className="p-3">
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Sources
                              </h4>
                              <div className="space-y-2">
                                {message.sources.map((source) => (
                                  <div key={source.id} className="text-xs bg-secondary/50 p-2 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium">{source.source}</span>
                                      <span className="text-muted-foreground">
                                        {source.similarity_score}% match
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground">{source.content_preview}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Related Topics */}
                        {message.related_topics && message.related_topics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Related Topics</h4>
                            <div className="flex flex-wrap gap-1">
                              {message.related_topics.map((topic, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => handleQuestionClick(`Tell me about ${topic.toLowerCase()}`)}
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {message.follow_up_questions && message.follow_up_questions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Follow-up Questions</h4>
                            <div className="space-y-1">
                              {message.follow_up_questions.map((question, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs justify-start h-auto p-2 hover:bg-secondary"
                                  onClick={() => handleQuestionClick(question)}
                                >
                                  <HelpCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-muted-foreground ml-2">Analyzing document...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your question about the legal document..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Status */}
          {ragHealth && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-space-grotesk">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Question Answering</span>
                    <div className="flex items-center space-x-1">
                      {ragHealth.capabilities?.question_answering ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Semantic Search</span>
                    <div className="flex items-center space-x-1">
                      {ragHealth.capabilities?.semantic_search ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Document Citation</span>
                    <div className="flex items-center space-x-1">
                      {ragHealth.capabilities?.document_citation ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              <CardTitle className="text-lg font-space-grotesk">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 hover:bg-secondary"
                    onClick={() => handleQuestionClick(question)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
