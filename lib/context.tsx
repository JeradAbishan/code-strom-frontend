"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { DocumentAnalysisResponse } from "@/lib/api";

// State interface
interface AppState {
  currentView: "dashboard" | "document" | "analyzing";
  currentDocument: {
    id: string;
    filename: string;
    analysisData: DocumentAnalysisResponse | null;
  } | null;
  uploadedFile: File | null;
  isProcessing: boolean;
  error: string | null;
  backendHealth: {
    isOnline: boolean;
    services: {
      direct_processing: boolean;
      vector_processing: boolean;
      rag_qa: boolean;
    };
  };
}

// Action types
type AppAction =
  | { type: "SET_VIEW"; payload: "dashboard" | "document" | "analyzing" }
  | {
      type: "SET_DOCUMENT";
      payload: {
        id: string;
        filename: string;
        analysisData?: DocumentAnalysisResponse;
      };
    }
  | { type: "SET_UPLOADED_FILE"; payload: File | null }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ANALYSIS_DATA"; payload: DocumentAnalysisResponse }
  | { type: "SET_BACKEND_HEALTH"; payload: any }
  | { type: "RESET_STATE" };

// Initial state
const initialState: AppState = {
  currentView: "dashboard",
  currentDocument: null,
  uploadedFile: null,
  isProcessing: false,
  error: null,
  backendHealth: {
    isOnline: false,
    services: {
      direct_processing: false,
      vector_processing: false,
      rag_qa: false,
    },
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "SET_DOCUMENT":
      return {
        ...state,
        currentDocument: {
          id: action.payload.id,
          filename: action.payload.filename,
          analysisData: action.payload.analysisData || null,
        },
      };

    case "SET_UPLOADED_FILE":
      return { ...state, uploadedFile: action.payload };

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_ANALYSIS_DATA":
      return {
        ...state,
        currentDocument: state.currentDocument
          ? {
              ...state.currentDocument,
              analysisData: action.payload,
            }
          : null,
      };

    case "SET_BACKEND_HEALTH":
      return {
        ...state,
        backendHealth: {
          isOnline:
            action.payload?.status === "healthy" ||
            action.payload?.status === "partial",
          services: {
            direct_processing:
              action.payload?.services?.direct_processing?.status === "healthy",
            vector_processing:
              action.payload?.services?.vector_processing?.status === "healthy",
            rag_qa: action.payload?.services?.rag_qa?.status === "healthy",
          },
        },
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// Action creators for easier use
export const appActions = {
  setView: (view: "dashboard" | "document" | "analyzing") => ({
    type: "SET_VIEW" as const,
    payload: view,
  }),
  setDocument: (
    id: string,
    filename: string,
    analysisData?: DocumentAnalysisResponse
  ) => ({
    type: "SET_DOCUMENT" as const,
    payload: { id, filename, analysisData },
  }),
  setUploadedFile: (file: File | null) => ({
    type: "SET_UPLOADED_FILE" as const,
    payload: file,
  }),
  setProcessing: (isProcessing: boolean) => ({
    type: "SET_PROCESSING" as const,
    payload: isProcessing,
  }),
  setError: (error: string | null) => ({
    type: "SET_ERROR" as const,
    payload: error,
  }),
  setAnalysisData: (data: DocumentAnalysisResponse) => ({
    type: "SET_ANALYSIS_DATA" as const,
    payload: data,
  }),
  setBackendHealth: (health: any) => ({
    type: "SET_BACKEND_HEALTH" as const,
    payload: health,
  }),
  resetState: () => ({ type: "RESET_STATE" as const }),
};
