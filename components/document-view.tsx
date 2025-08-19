"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  FileText,
  Shield,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { OverviewTab } from "./tabs/overview-tab";
import { EnhancedRiskAnalysisTab } from "./tabs/enhanced-risk-analysis-tab";
import { EnhancedObligationsTab } from "./tabs/enhanced-obligations-tab";
import { QATab as EnhancedQATab } from "./tabs/enhanced-qa-tab";
import { DocumentAnalysisResponse } from "@/lib/api";

interface DocumentViewProps {
  documentId: string;
  onBackToDashboard: () => void;
  uploadedFileName?: string;
  analysisData?: DocumentAnalysisResponse | null;
}

export function DocumentView({
  documentId,
  onBackToDashboard,
  uploadedFileName,
  analysisData,
}: DocumentViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  console.log("DocumentView received analysisData:", analysisData); // Debug log

  // Use real data from backend or fallback to mock data
  const document = {
    id: documentId,
    name:
      uploadedFileName ||
      analysisData?.metadata?.filename ||
      "Employment Agreement - John Smith.pdf",
    pages: analysisData?.metadata?.document_metadata?.pages || 15,
    language: "English",
    analyzedDate: new Date().toISOString().slice(0, 16).replace("T", " "),
    readTime: analysisData?.performance?.total_time
      ? `${analysisData.performance.total_time}s`
      : "2.3 minutes",
    risk: determineRiskLevel(analysisData),
    processing_time: analysisData?.performance?.total_time,
    target_achieved: analysisData?.performance?.target_achieved,
  };

  function determineRiskLevel(
    data: DocumentAnalysisResponse | null | undefined
  ): string {
    if (!data?.components?.risk_assessment) return "MEDIUM RISK";

    const riskLevel =
      data.components.risk_assessment.overall_risk_level?.toUpperCase();
    const riskScore = data.components.risk_assessment.risk_score || 0;

    if (riskLevel === "HIGH" || riskScore >= 8) return "HIGH RISK";
    if (riskLevel === "LOW" || riskScore <= 3) return "LOW RISK";
    return "MEDIUM RISK";
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "HIGH RISK":
        return "bg-red-100 text-red-800 border-red-200";
      case "LOW RISK":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    MM
                  </span>
                </div>
                <span className="text-sm font-medium">Mahesh Majoori</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Document Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2 font-space-grotesk">
                {document.name}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>•</span>
                <span>{document.language}</span>
                <span>•</span>
                <span>Analyzed {document.analyzedDate}</span>

                {/* Performance indicators */}
                {analysisData?.performance && (
                  <>
                    <span
                      className={`flex items-center ${
                        document.target_achieved
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {document.target_achieved ? "⚡ Fast" : "⏱️ Normal"}
                    </span>
                  </>
                )}

                <Badge className={`ml-4 ${getRiskColor(document.risk)}`}>
                  {document.risk}
                </Badge>
              </div>

              {/* Processing performance info */}
              {analysisData?.performance && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Processing: {analysisData.performance.total_time}s
                  {analysisData.performance.target_achieved && (
                    <span className="text-green-600 ml-2">
                      ✓ Under 20s target
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Original
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error handling */}
      {!analysisData && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Analysis data not available. Showing sample data for
                demonstration.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Risk Analysis</span>
            </TabsTrigger>
            <TabsTrigger
              value="obligations"
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Obligations</span>
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span>Q&A</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="risk">
            <EnhancedRiskAnalysisTab analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="obligations">
            <EnhancedObligationsTab analysisData={analysisData} />
          </TabsContent>

          <TabsContent value="qa">
            <EnhancedQATab documentId={documentId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Ask AI Button */}
      <Button
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 shadow-lg"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Ask AI
      </Button>
    </div>
  );
}
