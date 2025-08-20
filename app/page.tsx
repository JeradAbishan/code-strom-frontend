"use client";

import { useEffect } from "react";
import { Dashboard } from "@/components/dashboard";
import { DocumentView } from "@/components/document-view";
import { AnalyzingView } from "@/components/analyzing-view";
import { AppProvider, useAppContext, appActions } from "@/lib/context";
import { useEnhancedDocumentAnalysis, useBackendHealth } from "@/lib/hooks";

function HomeContent() {
  const { state, dispatch } = useAppContext();
  const { processDocument, isProcessing, analysisData, error, processingStatus, documentId } =
    useEnhancedDocumentAnalysis();
  const { healthStatus, isOnline } = useBackendHealth();

  // Update backend health in context
  useEffect(() => {
    if (healthStatus) {
      dispatch(appActions.setBackendHealth(healthStatus));
    }
  }, [healthStatus, dispatch]);

  // Handle document processing completion
  useEffect(() => {
    if (analysisData && !isProcessing) {
      console.log("Main page received analysisData:", analysisData); // Debug log
      
      // Set the document with the proper ID from enhanced processing
      if (documentId) {
        dispatch(appActions.setDocument(documentId, analysisData.metadata.filename));
      }
      
      dispatch(appActions.setAnalysisData(analysisData));
      dispatch(appActions.setView("document"));
      dispatch(appActions.setProcessing(false));
    }
  }, [analysisData, isProcessing, documentId, dispatch]);

  // Handle processing errors
  useEffect(() => {
    if (error) {
      dispatch(appActions.setError(error));
      dispatch(appActions.setView("dashboard"));
      dispatch(appActions.setProcessing(false));
    }
  }, [error, dispatch]);

  // Handle processing state
  useEffect(() => {
    dispatch(appActions.setProcessing(isProcessing));
  }, [isProcessing, dispatch]);

  const handleDocumentSelect = (docId: string) => {
    // For existing documents, we'll need to fetch their analysis data
    // For now, let's simulate with mock data but we could enhance this
    // to store analysis results and retrieve them
    dispatch(appActions.setDocument(docId, `Document-${docId}.pdf`));
    dispatch(appActions.setView("document"));
  };

  const handleAnalyzeDocument = async (file: File) => {
    try {
      dispatch(appActions.setUploadedFile(file));
      dispatch(appActions.setDocument("uploaded", file.name));
      dispatch(appActions.setView("analyzing"));
      dispatch(appActions.setError(null));

      // Process document with backend
      await processDocument(file);
    } catch (err) {
      console.error("Error processing document:", err);
      dispatch(appActions.setError("Failed to process document"));
      dispatch(appActions.setView("dashboard"));
    }
  };

  const handleBackToDashboard = () => {
    dispatch(appActions.setView("dashboard"));
    dispatch(appActions.setDocument("", ""));
    dispatch(appActions.setUploadedFile(null));
    dispatch(appActions.setError(null));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Backend Connection Status */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          ⚠️ Backend connection lost. Please check if the API server is running
          on localhost:8000
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-500 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1">
              <p className="text-sm font-medium">Processing Error</p>
              <p className="text-xs mt-1">{state.error}</p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="bg-white text-red-500 px-3 py-1 rounded text-xs font-medium hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {state.currentView === "dashboard" && (
        <Dashboard
          onDocumentSelect={handleDocumentSelect}
          onAnalyzeDocument={handleAnalyzeDocument}
          backendHealth={state.backendHealth}
        />
      )}

      {state.currentView === "analyzing" && (
        <AnalyzingView
          fileName={state.currentDocument?.filename}
          isProcessing={state.isProcessing}
          processingStatus={processingStatus}
        />
      )}

      {state.currentView === "document" && state.currentDocument && (
        <DocumentView
          documentId={state.currentDocument.id}
          onBackToDashboard={handleBackToDashboard}
          uploadedFileName={state.currentDocument.filename}
          analysisData={state.currentDocument.analysisData}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
