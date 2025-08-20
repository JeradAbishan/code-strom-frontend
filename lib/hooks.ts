import { useState, useEffect } from "react";
import { DocumentAPI, type DocumentAnalysisResponse, type EnhancedProcessingResponse, type ProcessingStatusResponse } from "@/lib/api";

// Hook for enhanced document processing with dual-process architecture
export function useEnhancedDocumentAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisData, setAnalysisData] = useState<DocumentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusResponse | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Helper function to poll for Q&A system readiness
  const pollForQAReadiness = async (docId: string) => {
    const maxAttempts = 20; // 3-4 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        // Try to check if the Q&A system is ready for this document
        const statusResponse = await DocumentAPI.checkProcessingStatus(docId);
        
        if (statusResponse.status === "success" && statusResponse.data) {
          const status = statusResponse.data;
          setProcessingStatus(status);

          // If Q&A system is ready, we can notify the user
          if (status.qa_system_ready || status.vector_storage_ready) {
            console.log("✅ Q&A system ready - vector storage complete!");
            return; // Stop polling
          }

          // Continue polling if not complete and under max attempts
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            console.log("⏰ Q&A polling timeout - continuing without Q&A features");
          }
        } else {
          // If status endpoint doesn't exist or fails, that's okay - just continue without Q&A
          console.log("ℹ️ Q&A status check unavailable - analysis complete without Q&A features");
        }
      } catch (error) {
        // Silently handle errors - Q&A features are optional
        console.log("ℹ️ Q&A system not available - analysis complete");
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisData(null);
    setProcessingStatus(null);
    setDocumentId(null);

    try {
      // Use the original process_direct endpoint for main analysis
      console.log("🚀 Processing document with original API...");
      const response = await DocumentAPI.processDocument(file);

      if (response.status === "success" && response.data) {
        const analysisData = response.data;
        console.log("✅ Document analysis completed successfully");
        
        // Set the analysis data from the original endpoint
        setAnalysisData(analysisData);
        
        // Check if backend provided a Q&A document ID
        const qaDocumentId = analysisData.metadata?.qa_document_id;
        const docId = qaDocumentId || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setDocumentId(docId);
        
        console.log("📚 Q&A Document ID:", docId);
        console.log("🔍 Backend provided Q&A ID:", qaDocumentId ? "Yes" : "No");
        
        // After successful analysis, check if background vector processing is available
        console.log("🔄 Checking for Q&A system readiness...");
        
        // Poll for Q&A system status to see if vector storage is complete
        pollForQAReadiness(docId);
        
      } else {
        // Handle processing error
        const errorMessage = response.error || "Failed to process document";
        
        if (errorMessage.includes("timeout") || errorMessage.includes("TimeoutError") || errorMessage.includes("futures unfinished")) {
          setError("Document processing timed out. The document may be too complex or the server is busy. Please try again with a smaller document or wait a few minutes.");
        } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
          setError("Server error occurred during processing. Please try again in a few moments.");
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        setError("Network error: Please check your connection and ensure the backend server is running on localhost:8000");
      } else if (errorMessage.includes("timeout")) {
        setError("Request timed out. The document processing is taking longer than expected. Please try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const pollProcessingStatus = async (docId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const statusResponse = await DocumentAPI.checkProcessingStatus(docId);
        
        if (statusResponse.status === "success" && statusResponse.data) {
          const status = statusResponse.data;
          setProcessingStatus(status);

          // If background processing is complete, we can enhance the analysis
          if (status.background_completed && status.qa_system_ready) {
            console.log("✅ Enhanced processing complete - Q&A system ready!");
            return; // Stop polling
          }

          // Continue polling if not complete and under max attempts
          if (attempts < maxAttempts && !status.background_completed) {
            attempts++;
            setTimeout(poll, 10000); // Poll every 10 seconds
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 3000);
  };

  const reset = () => {
    setAnalysisData(null);
    setError(null);
    setIsProcessing(false);
    setProcessingStatus(null);
    setDocumentId(null);
  };

  return {
    processDocument,
    isProcessing,
    analysisData,
    error,
    processingStatus,
    documentId,
    reset,
  };
}

// Legacy hook for backwards compatibility
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
