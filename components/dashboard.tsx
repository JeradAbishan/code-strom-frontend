"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Upload,
  Eye,
  Download,
  Clock,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";

interface DashboardProps {
  onDocumentSelect: (docId: string) => void;
  onAnalyzeDocument: (file: File) => void;
  backendHealth?: {
    isOnline: boolean;
    services: {
      direct_processing: boolean;
      vector_processing: boolean;
      rag_qa: boolean;
    };
  };
}

export function Dashboard({
  onDocumentSelect,
  onAnalyzeDocument,
  backendHealth,
}: DashboardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Dynamic stats based on backend availability
  const getStats = () => {
    const baseStats = [
      {
        title: "Backend Status",
        value: backendHealth?.isOnline ? "Online" : "Offline",
        change: backendHealth?.isOnline ? "AI Ready" : "Check Connection",
        icon: backendHealth?.isOnline ? Wifi : WifiOff,
        color: backendHealth?.isOnline ? "text-green-600" : "text-red-600",
      },
      {
        title: "Direct Processing",
        value: backendHealth?.services.direct_processing
          ? "Ready"
          : "Unavailable",
        change: "Document Analysis",
        icon: CheckCircle,
        color: backendHealth?.services.direct_processing
          ? "text-green-600"
          : "text-gray-400",
      },
      {
        title: "Q&A Service",
        value: backendHealth?.services.rag_qa ? "Active" : "Inactive",
        change: "RAG-powered Q&A",
        icon: AlertTriangle,
        color: backendHealth?.services.rag_qa
          ? "text-green-600"
          : "text-yellow-600",
      },
      {
        title: "Performance Target",
        value: "<20s",
        change: "AI Analysis Speed",
        icon: TrendingUp,
        color: "text-blue-600",
      },
    ];
    return baseStats;
  };

  const stats = getStats();

  // Sample documents for demo purposes
  const documents = [
    {
      id: "1",
      name: "Employment Agreement - John Smith.pdf",
      size: "2.4 MB",
      date: "2025-01-16",
      language: "English",
      risk: "MEDIUM",
      compliance: 85,
      confidence: 92,
      issues: ["Unilateral termination rights", "Broad non-compete clause"],
    },
    {
      id: "2",
      name: "NDA - Tech Startup Inc.docx",
      size: "1.8 MB",
      date: "2025-01-15",
      language: "English",
      risk: "HIGH",
      compliance: 72,
      confidence: 88,
      issues: ["Overly broad scope", "Excessive confidentiality period"],
    },
    {
      id: "3",
      name: "Service Agreement Draft.pdf",
      size: "3.1 MB",
      date: "2025-01-14",
      language: "English",
      risk: "LOW",
      compliance: 95,
      confidence: 98,
      issues: ["Standard payment terms"],
    },
  ];

  const recentActivity = [
    {
      type: "complete",
      message: backendHealth?.isOnline
        ? "Backend services are online and ready for document analysis"
        : "Backend services are offline - please check API connection",
      time: "Just now",
    },
    {
      type: "complete",
      message:
        "Document analysis completed: Employment Agreement - John Smith.pdf",
      time: "4 hours ago",
    },
    {
      type: "reminder",
      message:
        "Upcoming deadline reminder: Service Agreement review due in 3 days",
      time: "6 hours ago",
    },
    {
      type: "complete",
      message:
        "Compliance check completed: NDA - Tech Startup Inc.docx scored 72%",
      time: "8 hours ago",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleAnalyze = () => {
    if (uploadedFile && backendHealth?.isOnline) {
      onAnalyzeDocument(uploadedFile);
      setUploadedFile(null); // Clear file after processing
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-600 italic">
                Legal Doc Analyser
              </h1>
              {backendHealth && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      backendHealth.isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {backendHealth.isOnline
                      ? "API Connected"
                      : "API Disconnected"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">MM</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Mahesh Majoori
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Monitor your document analysis and compliance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Smart Document Processing
                    </h3>
                    <p className="text-gray-600 mb-4">
                      AI-powered legal document analysis with parallel
                      processing for sub-20 second response times.
                    </p>

                    <div className="flex space-x-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Risk Analysis
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Q&A
                      </span>
                      <span>Multi-language</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">
                    Recent Documents
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 bg-transparent"
                    >
                      All Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 bg-transparent"
                    >
                      All Risks
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {doc.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                            <span>•</span>
                            <span>{doc.language}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {doc.issues[0]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-green-600">
                                {doc.compliance}% compliant
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-indigo-600">
                                {doc.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getRiskColor(doc.risk)}>
                          {doc.risk}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDocumentSelect(doc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>

                  {!backendHealth?.isOnline && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">
                        ⚠️ Backend API is not available. Please ensure the API
                        server is running on localhost:8000
                      </p>
                    </div>
                  )}

                  {uploadedFile ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Document Ready
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-indigo-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">
                              {uploadedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={!backendHealth?.isOnline}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 disabled:bg-gray-400"
                      >
                        {backendHealth?.isOnline
                          ? "Analyse with AI"
                          : "Backend Offline"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Drag & Drop your PDF here
                      </h3>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                          dragActive
                            ? "border-indigo-400 bg-indigo-50"
                            : backendHealth?.isOnline
                            ? "border-gray-300"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (backendHealth?.isOnline) setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                      >
                        <div className="text-center">
                          <Upload
                            className={`mx-auto h-12 w-12 mb-4 ${
                              backendHealth?.isOnline
                                ? "text-gray-400"
                                : "text-gray-300"
                            }`}
                          />
                          <p className="text-gray-600 mb-4">or</p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="file-upload"
                            disabled={!backendHealth?.isOnline}
                          />
                          <label htmlFor="file-upload">
                            <Button
                              asChild
                              disabled={!backendHealth?.isOnline}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
                            >
                              <span className="cursor-pointer">
                                {backendHealth?.isOnline
                                  ? "Browse Files"
                                  : "Backend Required"}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    AI Assistant
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get instant answers about your documents, risk assessments,
                    and compliance questions with RAG-powered Q&A.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        backendHealth?.services.rag_qa
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-gray-500">
                      {backendHealth?.services.rag_qa
                        ? "Q&A Available 24/7"
                        : "Q&A Service Offline"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
