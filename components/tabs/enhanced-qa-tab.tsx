"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  User,
  Bot,
  HelpCircle,
  ExternalLink,
  FileText,
  Clock,
} from "lucide-react";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  confidence?: number;
  sources?: Array<{
    id: number;
    content_preview: string;
    similarity_score: number;
    source: string;
  }>;
  related_topics?: string[];
  follow_up_questions?: string[];
  processing_time?: number;
}

interface QATabProps {
  documentId?: string;
}

// Enhanced markdown components for ChatGPT-style formatting with proper structure
const MarkdownComponents = {
  // Proper paragraph spacing with minimal margins
  p: ({ children, ...props }: any) => (
    <p
      className="mb-2 mt-1 leading-relaxed text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
      {...props}
    >
      {children}
    </p>
  ),

  // Structured heading spacing for clear hierarchy
  h1: ({ children, ...props }: any) => (
    <h1
      className="text-lg font-bold mb-2 mt-4 first:mt-0 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2
      className="text-base font-bold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3
      className="text-sm font-bold mb-1 mt-2 first:mt-0 text-gray-800 dark:text-gray-200"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4
      className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-gray-800 dark:text-gray-200"
      {...props}
    >
      {children}
    </h4>
  ),

  // Structured list spacing with proper margins
  ul: ({ children, ...props }: any) => (
    <ul
      className="mb-2 mt-1 ml-4 space-y-0.5 list-disc marker:text-gray-600 dark:marker:text-gray-400"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol
      className="mb-2 mt-1 ml-4 space-y-0.5 list-decimal marker:text-gray-600 dark:marker:text-gray-400"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li
      className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
      {...props}
    >
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

  // Structured blockquote spacing
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 pl-3 py-2 mb-3 mt-2 italic text-gray-700 dark:text-gray-300 rounded-r-md"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Enhanced code styling with syntax highlighting appearance
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-xs font-mono border"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg mb-3 mt-2 overflow-x-auto border"
        {...props}
      >
        <code className="text-sm font-mono">{children}</code>
      </pre>
    );
  },

  // Structured table spacing
  table: ({ children, ...props }: any) => (
    <div className="mb-3 mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider"
      {...props}
    >
      {children}
    </th>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody
      className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
      {...props}
    >
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props}>
      {children}
    </tr>
  ),
  td: ({ children, ...props }: any) => (
    <td
      className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
      {...props}
    >
      {children}
    </td>
  ),

  // Structured horizontal rule spacing
  hr: ({ ...props }: any) => (
    <hr className="my-3 border-gray-300 dark:border-gray-600" {...props} />
  ),

  // Add support for strikethrough
  del: ({ children, ...props }: any) => (
    <del className="line-through text-gray-500 dark:text-gray-400" {...props}>
      {children}
    </del>
  ),

  // Enhanced link styling
  a: ({ children, ...props }: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
      {...props}
    >
      {children}
    </a>
  ),
};

export function QATab({ documentId }: QATabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState(false); // New state to track if chat is started

  const quickTopics = [
    "Termination Conditions",
    "Liability Limitations",
    "Intellectual Property Rights",
    "Dispute Resolution",
    "Confidentiality Clauses",
    "Payment Terms",
  ];
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.swift-supply.xyz";

  // Load suggested questions on component mount
  useEffect(() => {
    loadSuggestedQuestions();
  }, [documentId]);

  const loadSuggestedQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (documentId) {
        params.append("document_id", documentId);
      }

      const response = await fetch(
        `${API_BASE_URL}/suggested_questions?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.suggested_questions || []);
      }
    } catch (error) {
      console.error("Failed to load suggested questions:", error);
      // Fallback to default questions
      setSuggestedQuestions([
        "What are the key obligations for each party?",
        "What are the termination conditions?",
        "How are disputes resolved?",
        "What are the liability limitations?",
        "What intellectual property rights are involved?",
        "What are the payment terms and conditions?",
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    // Ensure chat is started when sending a message
    if (!chatStarted) {
      setChatStarted(true);
    }

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: newMessage,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = newMessage;
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ask_question?query=${encodeURIComponent(queryText)}${
          documentId ? `&document_id=${documentId}` : ""
        }`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();

        const aiMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: data.answer,
          timestamp: "Just now",
          confidence: data.confidence_score,
          sources: data.citations,
          related_topics: data.related_topics,
          follow_up_questions: data.follow_up_questions,
          processing_time: data.processing_time,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorData = await response.json();
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: `Sorry, I encountered an error: ${
            errorData.detail || "Unknown error"
          }`,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: `Sorry, I encountered a connection error. Please check if the backend API is running.`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setNewMessage(question);
    if (!chatStarted) {
      setChatStarted(true);
      // Focus input after state update
      setTimeout(() => {
        const input = document.querySelector(
          'input[placeholder*="question"]'
        ) as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  };

  const handleStartChat = () => {
    setChatStarted(true);
    // Focus input after state update
    setTimeout(() => {
      const input = document.querySelector(
        'input[placeholder*="question"]'
      ) as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - simplified */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Document Q&A
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask questions about this contract and get AI-powered answers
        </p>
      </div>

      {/* Show different UI based on chat state */}
      {messages.length === 0 && !chatStarted ? (
        /* New Chat State - Show Interactive Document Analysis */
        <div className="flex-1 flex flex-col">
          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Interactive Document Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Use our AI chatbot to ask specific questions about this
                document. Get instant answers about clauses, risks, obligations,
                and legal implications.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mb-8"
                onClick={handleStartChat}
              >
                <Bot className="h-4 w-4 mr-2" />
                Open AI Chat Assistant
              </Button>
            </div>
          </div>

          {/* Suggested Questions Section - Only show when chat not started */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
              Suggested Questions:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.slice(0, 6).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : messages.length === 0 && chatStarted ? (
        /* Chat Started but No Messages - Show Input Only */
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
          {/* Center prompt to start asking questions */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI Assistant Ready
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Ask me anything about this legal document!
              </p>
            </div>
          </div>

          {/* Input Section with better spacing and height */}
          <div className="mb-8">
            <div className="flex space-x-3">
              <textarea
                placeholder="Type your question about this legal document..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 min-h-[60px] max-h-[120px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
                autoFocus
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 h-[60px] px-6 rounded-lg"
                disabled={isLoading || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Chat State - Show Messages Only */
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4">
          {/* Chat Messages with confidence display */}
          {messages.length > 0 && (
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Confidence:
                </span>
                <span className="text-sm font-bold text-blue-600">
                  92% High
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Focus on input
                  const input = document.querySelector(
                    'textarea[placeholder*="question"]'
                  ) as HTMLTextAreaElement;
                  if (input) input.focus();
                }}
              >
                Open Detailed AI Assistant
              </Button>
            </div>
          )}

          {/* Quick Topics Pills - Only show for last message */}
          {messages.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {quickTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleQuestionClick(`Tell me about ${topic.toLowerCase()}`)
                  }
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          {/* Messages Container with auto scroll and 80% width */}
          <div
            className="flex-1 space-y-6 overflow-y-auto max-h-[500px] mb-6"
            ref={(el) => {
              if (el && messages.length > 0) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-3">
                <div
                  className={`flex items-start space-x-4 ${
                    message.type === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.type === "ai" && (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.type === "ai" ? (
                      <div className="max-w-none overflow-hidden whitespace-pre-wrap break-words">
                        <ReactMarkdown
                          components={MarkdownComponents}
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}

                    {/* AI message metadata - Remove "Just now" */}
                    {message.type === "ai" && (
                      <div className="mt-3 space-y-2">
                        {message.confidence !== undefined && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Confidence:
                            </span>
                            <span
                              className={`text-xs font-medium ${getConfidenceColor(
                                message.confidence
                              )}`}
                            >
                              {message.confidence.toFixed(1)}%
                            </span>
                            <Progress
                              value={message.confidence}
                              className="h-1 w-16"
                            />
                          </div>
                        )}
                        {message.processing_time && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{message.processing_time.toFixed(2)}s</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {message.type === "user" && (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Sources and additional info for AI messages */}
                {message.type === "ai" &&
                  (message.sources ||
                    message.related_topics ||
                    message.follow_up_questions) && (
                    <div className="ml-14 space-y-4">
                      {message.sources && message.sources.length > 0 && (
                        <Card className="border-gray-200 dark:border-gray-700">
                          <CardContent className="p-4">
                            <h4 className="text-sm font-medium mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Sources
                            </h4>
                            <div className="space-y-3">
                              {message.sources.map((source) => (
                                <div
                                  key={source.id}
                                  className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">
                                      {source.source}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {source.similarity_score}% match
                                    </span>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-300">
                                    {source.content_preview}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Show follow-up questions only for the last AI message */}
                      {index === messages.length - 1 &&
                        message.follow_up_questions &&
                        message.follow_up_questions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                              Suggested follow-up questions:
                            </h4>
                            <div className="space-y-2">
                              {message.follow_up_questions.map(
                                (question, qIndex) => (
                                  <button
                                    key={qIndex}
                                    onClick={() =>
                                      handleQuestionClick(question)
                                    }
                                    className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-sm text-blue-700 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800"
                                  >
                                    <HelpCircle className="h-3 w-3 mr-2 inline" />
                                    {question}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      Analyzing document...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Section for Active Chat with increased height */}
          <div className="mb-4">
            <div className="flex space-x-3">
              <textarea
                placeholder="Type your question about this legal document..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 min-h-[60px] max-h-[120px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 h-[60px] px-6 rounded-lg"
                disabled={isLoading || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
