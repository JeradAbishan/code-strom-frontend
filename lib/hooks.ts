import { useState, useEffect } from "react";
import { DocumentAPI, type DocumentAnalysisResponse } from "@/lib/api";

// Hook for document processing
export function useDocumentAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisData, setAnalysisData] =
    useState<DocumentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await DocumentAPI.processDocument(file);

      if (response.status === "success" && response.data) {
        setAnalysisData(response.data);
      } else {
        setError(response.error || "Failed to process document");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setAnalysisData(null);
    setError(null);
    setIsProcessing(false);
  };

  return {
    processDocument,
    isProcessing,
    analysisData,
    error,
    reset,
  };
}

// Hook for Q&A functionality
export function useDocumentQA(documentId?: string) {
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: number;
      type: "user" | "ai";
      content: string;
      timestamp: string;
      confidence?: number;
      sources?: any[];
      related_topics?: string[];
      follow_up_questions?: string[];
      processing_time?: number;
    }>
  >([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const askQuestion = async (query: string) => {
    if (!query.trim() || isAsking) return;

    const userMessage = {
      id: Date.now(),
      type: "user" as const,
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const response = await DocumentAPI.askQuestion(query, documentId);

      if (response.status === "success" && response.data) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai" as const,
          content: response.data.answer,
          timestamp: new Date().toLocaleTimeString(),
          confidence: response.data.confidence_score,
          sources: response.data.citations,
          related_topics: response.data.related_topics,
          follow_up_questions: response.data.follow_up_questions,
          processing_time: response.data.processing_time,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: "ai" as const,
          content: `Sorry, I encountered an error: ${
            response.error || "Unknown error"
          }`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai" as const,
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const loadSuggestedQuestions = async () => {
    try {
      const response = await DocumentAPI.getSuggestedQuestions(documentId);
      if (response.status === "success" && response.data) {
        setSuggestedQuestions(response.data.suggested_questions);
      }
    } catch (error) {
      console.error("Failed to load suggested questions:", error);
      // Fallback questions
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

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    loadSuggestedQuestions();
  }, [documentId]);

  return {
    askQuestion,
    isAsking,
    messages,
    suggestedQuestions,
    clearMessages,
    loadSuggestedQuestions,
  };
}

// Hook for backend health monitoring
export function useBackendHealth() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [ragHealth, setRagHealth] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checkHealth = async () => {
    try {
      const [healthResponse, ragResponse] = await Promise.all([
        DocumentAPI.healthCheck(),
        DocumentAPI.checkRAGHealth(),
      ]);

      if (healthResponse.status === "success") {
        setHealthStatus(healthResponse.data);
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }

      if (ragResponse.status === "success") {
        setRagHealth(ragResponse.data);
      }
    } catch (error) {
      setIsOnline(false);
      console.error("Health check failed:", error);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    healthStatus,
    ragHealth,
    isOnline,
    checkHealth,
  };
}

// Custom hook for managing document analysis state
export function useDocumentState() {
  const [currentDocument, setCurrentDocument] = useState<{
    id: string;
    filename: string;
    analysisData: DocumentAnalysisResponse | null;
  } | null>(null);

  const setDocument = (
    id: string,
    filename: string,
    analysisData: DocumentAnalysisResponse | null = null
  ) => {
    setCurrentDocument({ id, filename, analysisData });
  };

  const updateAnalysisData = (analysisData: DocumentAnalysisResponse) => {
    if (currentDocument) {
      setCurrentDocument({
        ...currentDocument,
        analysisData,
      });
    }
  };

  const clearDocument = () => {
    setCurrentDocument(null);
  };

  return {
    currentDocument,
    setDocument,
    updateAnalysisData,
    clearDocument,
  };
}
