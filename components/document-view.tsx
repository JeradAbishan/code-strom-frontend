"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { OverviewTab } from "./tabs/overview-tab"
import { RiskAnalysisTab } from "./tabs/risk-analysis-tab"
import { ObligationsTab } from "./tabs/obligations-tab"
import { QATab as EnhancedQATab } from "./tabs/enhanced-qa-tab"

interface DocumentViewProps {
  documentId: string
  onBackToDashboard: () => void
}

export function DocumentView({ documentId, onBackToDashboard }: DocumentViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock document data
  const document = {
    id: documentId,
    name: "Employment Agreement - John Smith.pdf",
    pages: 15,
    language: "English",
    analyzedDate: "2025-01-16 14:30",
    readTime: "2.3 minutes",
    risk: "MEDIUM RISK",
  }

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
                  <span className="text-sm font-medium text-primary-foreground">MM</span>
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
              <h1 className="text-2xl font-bold text-foreground mb-2 font-space-grotesk">{document.name}</h1>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {document.pages} pages
                </span>
                <span>•</span>
                <span>{document.language}</span>
                <span>•</span>
                <span>Analyzed {document.analyzedDate}</span>
                <span>•</span>
                <span>{document.readTime}</span>
                <Badge className="ml-4 bg-yellow-100 text-yellow-800 border-yellow-200">{document.risk}</Badge>
              </div>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Risk Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="obligations" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Obligations</span>
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span>Q&A</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="risk">
            <RiskAnalysisTab />
          </TabsContent>

          <TabsContent value="obligations">
            <ObligationsTab />
          </TabsContent>

          <TabsContent value="qa">
            <EnhancedQATab documentId={documentId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Ask AI Button */}
      <Button className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 shadow-lg" size="lg">
        <MessageSquare className="h-5 w-5 mr-2" />
        Ask AI
      </Button>
    </div>
  )
}
