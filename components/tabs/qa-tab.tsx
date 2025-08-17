"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, User, Bot, HelpCircle } from "lucide-react"

export function QATab() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "user",
      content: "What are the key obligations for the service provider in this contract?",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      type: "ai",
      content:
        "Based on the analyzed document, the key obligations for the service provider include delivering services according to Schedule A, maintaining confidentiality, and ensuring compliance with all applicable data protection laws. Specific performance metrics are detailed in Section 3.2.",
      timestamp: "2 minutes ago",
    },
    {
      id: 3,
      type: "user",
      content: "Can you summarize the termination conditions?",
      timestamp: "1 minute ago",
    },
    {
      id: 4,
      type: "ai",
      content:
        "The document outlines several termination conditions: either party may terminate for material breach with 30 days' written notice, or by mutual agreement. Additionally, either party may terminate if the other becomes insolvent or files for bankruptcy. Sections 7.1 to 7.5 provide full details.",
      timestamp: "1 minute ago",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const suggestedQuestions = [
    "What are the termination conditions?",
    "Explain the liability limitations",
    "What are my key obligations?",
    "How does the non-compete clause work?",
    "What happens if I breach the contract?",
    "Can you summarize the payment terms?",
  ]

  const quickTopics = [
    "Termination Conditions",
    "Liability Limitations",
    "Intellectual Property Rights",
    "Dispute Resolution",
    "Confidentiality Clauses",
    "Payment Terms",
  ]

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: newMessage,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content:
          "I'm analyzing your question about the contract. Let me review the relevant sections and provide you with a detailed answer based on the document analysis.",
        timestamp: "Just now",
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const handleQuestionClick = (question: string) => {
    setNewMessage(question)
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
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">AI Confidence: 92% High</span>
              </div>
              <Button variant="outline" size="sm">
                Open Detailed AI Assistant
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
                Use our AI chatbot to ask specific questions about this document. Get instant answers about clauses,
                risks, obligations, and legal implications.
              </p>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
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
                  placeholder="Type your question about the legal document..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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
