"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface AnalyzingViewProps {
  fileName?: string
}

export function AnalyzingView({ fileName }: AnalyzingViewProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "AI-powered risk analysis with confidence scoring and detailed report generation...",
    "Identifying key topics in the document...",
    "Extracting legal clauses related to termination...",
    "Cross-checking with relevant contract law, Section 12...",
    "Summarizing risks and obligations...",
    "Finalizing report... explanations.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4 bg-white border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          {fileName && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{fileName}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>15 pages</span>
                <span>•</span>
                <span>English</span>
                <span>•</span>
                <span>Analyzed 2025-01-16 14:30</span>
                <span>•</span>
                <span>2.3 minutes</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">MEDIUM RISK</span>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing...</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{steps[currentStep]}</p>
          </div>

          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Summary</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Risk Analysis</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Obligations</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-indigo-600 animate-pulse rounded-full"></div>
              <span className="text-gray-900 font-medium">Q&A</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
