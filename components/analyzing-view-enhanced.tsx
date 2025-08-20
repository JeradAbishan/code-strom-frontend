"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Zap, Database, Brain } from "lucide-react";

interface AnalyzingViewProps {
  fileName?: string;
  isProcessing?: boolean;
  processingStatus?: {
    fast_track_completed: boolean;
    background_completed: boolean;
    vector_storage_ready: boolean;
    summary_embedding_ready: boolean;
    qa_system_ready: boolean;
    processing_times: {
      fast_track: number;
      background_processing?: number;
      total_time?: number;
    };
  };
}

export function AnalyzingView({
  fileName,
  isProcessing = true,
  processingStatus,
}: AnalyzingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "🚀 Fast AI Analysis (Direct Processing)...",
    "📄 Document Summary Generation...",
    "🔍 Background Vector Processing...",
    "🗃️ Chunk Embedding & Storage...",
    "🧠 Q&A Knowledge Base Setup...",
    "✅ Enhanced Dual-Process Complete!",
  ];

  const enhancedSteps = [
    {
      icon: Zap,
      title: "Fast Track Analysis",
      description: "AI-powered document summarization",
      completed: processingStatus?.fast_track_completed || false,
      time: processingStatus?.processing_times?.fast_track,
    },
    {
      icon: Database,
      title: "Vector Processing",
      description: "Background embedding & chunking",
      completed: processingStatus?.vector_storage_ready || false,
      time: processingStatus?.processing_times?.background_processing,
    },
    {
      icon: Brain,
      title: "Q&A System",
      description: "Interactive knowledge base ready",
      completed: processingStatus?.qa_system_ready || false,
      time: processingStatus?.processing_times?.total_time,
    },
  ];

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        return next;
      });

      // Simulate progress based on processing status
      setProgress((prev) => {
        if (processingStatus?.fast_track_completed && prev < 40) {
          return 40; // Fast track complete
        }
        if (processingStatus?.vector_storage_ready && prev < 70) {
          return 70; // Vector processing complete
        }
        if (processingStatus?.qa_system_ready && prev < 100) {
          return 100; // Everything complete
        }

        const increment = Math.random() * 10 + 2; // Slower increments
        return Math.min(prev + increment, 85); // Cap at 85% until completion
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing, steps.length, processingStatus]);

  // Calculate overall progress based on completed steps
  const overallProgress = enhancedSteps.reduce((acc, step) => {
    return acc + (step.completed ? 33.33 : 0);
  }, 0);

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
                Enhanced Document Analysis
              </h2>
              <p className="text-muted-foreground">
                Processing: {fileName || "document"}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                Dual-Process Architecture: Fast AI Analysis + Background Vector
                Processing
              </div>
            </div>

            {/* Enhanced Progress Steps */}
            <div className="space-y-6 mb-8">
              {enhancedSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">
                          {step.title}
                        </h3>
                        {step.completed && step.time && (
                          <span className="text-xs text-muted-foreground">
                            {step.time.toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              {processingStatus?.fast_track_completed && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ Fast analysis complete - Document ready for viewing!
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
            {processingStatus && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
