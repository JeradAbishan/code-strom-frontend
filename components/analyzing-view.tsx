"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyzingViewProps {
  fileName?: string;
  isProcessing?: boolean;
}

export function AnalyzingView({
  fileName,
  isProcessing = true,
}: AnalyzingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Uploading document to AI analysis engine...",
    "AI-powered risk analysis with confidence scoring...",
    "Extracting legal clauses and key obligations...",
    "Cross-checking with relevant contract law databases...",
    "Generating compliance scores and recommendations...",
    "Creating comprehensive analysis report...",
    "Finalizing Q&A knowledge base integration...",
  ];

  const completedSteps = [
    "✅ Document uploaded successfully",
    "✅ Text extraction completed",
    "✅ AI agents initialized",
    "🔄 Summary analysis in progress...",
    "⏳ Risk assessment processing...",
    "⏳ Key highlights extraction...",
    "⏳ Confidence metrics calculation...",
  ];

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        return next;
      });

      // Simulate progress
      setProgress((prev) => {
        const increment = Math.random() * 15 + 5; // 5-20% increments
        return Math.min(prev + increment, 95); // Cap at 95% until completion
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [steps.length, isProcessing]);

  // Reset progress when processing starts
  useEffect(() => {
    if (isProcessing) {
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-3xl mx-4 bg-white border-gray-200 shadow-lg">
        <CardContent className="p-12 text-center">
          {fileName && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {fileName}
              </h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>PDF Document</span>
                <span>•</span>
                <span>AI Analysis</span>
                <span>•</span>
                <span>Target: &lt;20 seconds</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  PROCESSING
                </span>
              </div>
            </div>
          )}

          <div className="mb-10">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-6 bg-indigo-50 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl">🧠</span>
                  <div className="text-xs font-medium text-indigo-600 mt-1">
                    {progress.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI Analysis in Progress
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto text-lg">
              {steps[currentStep]}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Processing...</span>
                <span>{progress.toFixed(0)}% Complete</span>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-4">
                Analysis Components
              </h3>
              <div className="space-y-3">
                {completedSteps.slice(0, 4).map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <span className="text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-4">
                AI Agents Active
              </h3>
              <div className="space-y-3">
                {completedSteps.slice(4).map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <span className="text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              What You&apos;ll Get
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="font-medium text-gray-900">Risk Analysis</p>
                <p className="text-gray-500 text-xs">
                  Detailed risk assessment
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚖️</span>
                </div>
                <p className="font-medium text-gray-900">Legal Summary</p>
                <p className="text-gray-500 text-xs">Key obligations & terms</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="font-medium text-gray-900">Q&A Ready</p>
                <p className="text-gray-500 text-xs">
                  Interactive document chat
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="font-medium text-gray-900">Confidence Score</p>
                <p className="text-gray-500 text-xs">Analysis reliability</p>
              </div>
            </div>
          </div>

          {/* Performance Info */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-center space-x-4 text-sm text-indigo-800">
              <span className="flex items-center">
                <span className="text-xl mr-2">⚡</span>
                Parallel AI Processing
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-xl mr-2">🎯</span>
                Target: &lt;20 seconds
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="text-xl mr-2">🤖</span>4 AI Agents
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
