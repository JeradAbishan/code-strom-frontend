"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { DocumentView } from "@/components/document-view"
import { AnalyzingView } from "@/components/analyzing-view"

export default function Home() {
  const [currentView, setCurrentView] = useState<"dashboard" | "document" | "analyzing">("dashboard")
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocument(docId)
    setCurrentView("analyzing")
    // Simulate analysis time
    setTimeout(() => {
      setCurrentView("document")
    }, 3000)
  }

  const handleAnalyzeDocument = (file: File) => {
    setUploadedFile(file)
    setSelectedDocument("uploaded")
    setCurrentView("analyzing")
    // Simulate analysis time for uploaded document
    setTimeout(() => {
      setCurrentView("document")
    }, 6000)
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedDocument(null)
    setUploadedFile(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "dashboard" && (
        <Dashboard onDocumentSelect={handleDocumentSelect} onAnalyzeDocument={handleAnalyzeDocument} />
      )}
      {currentView === "analyzing" && <AnalyzingView fileName={uploadedFile?.name} />}
      {currentView === "document" && selectedDocument && (
        <DocumentView
          documentId={selectedDocument}
          onBackToDashboard={handleBackToDashboard}
          uploadedFileName={uploadedFile?.name}
        />
      )}
    </div>
  )
}
