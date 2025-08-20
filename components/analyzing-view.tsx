"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { ProcessingStatusResponse } from "@/lib/api";

interface AnalyzingViewProps {
  fileName?: string;
  isProcessing?: boolean;
  processingStatus?: ProcessingStatusResponse | null;
}

export function AnalyzingView({
  fileName,
  isProcessing = true,
  processingStatus,
}: AnalyzingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const steps = [
    "🚀 Processing Document with Original API...",
    "📄 Generating Complete Analysis...",
    "✅ Analysis Complete - Results Ready!",
    "🔍 Background: Setting up Q&A System...",
    "🗃️ Background: Vector Storage Processing...",
    "🧠 Q&A Knowledge Base Ready!",
  ];

  useEffect(() => {
    if (!isProcessing) return;

    // Timer for elapsed time
    const timeInterval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(stepInterval);
    };
  }, [isProcessing, steps.length]);

  // Show slow warning after 45 seconds
  useEffect(() => {
    if (timeElapsed > 45 && !processingStatus?.fast_track_completed) {
      setShowSlowWarning(true);
    }
  }, [timeElapsed, processingStatus?.fast_track_completed]);

  // Calculate simple progress based on processing status
  const getSimpleProgress = () => {
    if (processingStatus?.fast_track_completed) return 100;
    if (timeElapsed > 60) return 80;
    if (timeElapsed > 30) return 50;
    return Math.min((timeElapsed / 60) * 40, 40); // Cap at 40% until completion
  };

  const displayProgress = getSimpleProgress();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-space-grotesk font-bold text-foreground mb-2">
                Document Analysis
              </h2>
              <p className="text-muted-foreground">
                Processing: {fileName || "document"}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                Time elapsed: {Math.floor(timeElapsed / 60)}:
                {(timeElapsed % 60).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Simple Progress Display */}
            <div className="mb-8">
              {/* Single Alert Section */}
              {timeElapsed > 45 && !processingStatus?.fast_track_completed && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Processing is taking longer than expected
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Complex documents may take 1-2 minutes. The system is
                        working on your analysis...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {timeElapsed > 90 && !processingStatus?.fast_track_completed && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Processing is taking longer than expected
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        The AI agents are working on complex analysis. This may
                        take up to 2-3 minutes for large documents.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(displayProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${displayProgress}%` }}
                ></div>
              </div>
              {timeElapsed > 0 && (
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  Processing... ({timeElapsed}s elapsed)
                </div>
              )}
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              {processingStatus?.fast_track_completed && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Analysis Complete - Results Ready!
                </div>
              )}
              {processingStatus?.vector_storage_ready && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  🗃️ Vector storage ready - Enhanced search capabilities enabled
                </div>
              )}
              {processingStatus?.qa_system_ready && (
                <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded">
                  🧠 Q&A system ready - Ask questions about your document!
                </div>
              )}
            </div>

            {/* Performance Info */}
            {processingStatus?.processing_times && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fast Track:</span>
                    <span className="ml-2 font-medium">
                      {processingStatus.processing_times.fast_track?.toFixed(1)}
                      s
                    </span>
                  </div>
                  {processingStatus.processing_times.background_processing && (
                    <div>
                      <span className="text-muted-foreground">Background:</span>
                      <span className="ml-2 font-medium">
                        {processingStatus.processing_times.background_processing?.toFixed(
                          1
                        )}
                        s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Step Display */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>{steps[currentStep]}</span>
              </div>

              {/* Additional Status for Long Processing */}
              {timeElapsed > 30 && !processingStatus?.fast_track_completed && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      Processing complex document - this may take a moment...
                    </span>
                  </div>
                </div>
              )}

              {timeElapsed > 90 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-primary hover:underline"
                  >
                    Refresh page if processing seems stuck
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
