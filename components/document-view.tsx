"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  X,
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
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Handle Ask AI button click
  const handleAskAI = () => {
    setActiveTab("qa");
  };

  // Handle View Original button click
  const handleViewOriginal = () => {
    setShowPdfViewer(true);
  };

  const handleDownloadOriginal = () => {
    try {
      // Create a download link for the original PDF
      // In a real application, this would fetch the original PDF from the server
      const link = window.document.createElement("a");

      // For demo purposes, create a simple PDF with document info
      const pdfContent = `data:application/pdf;base64,${btoa(`
        This is a demo PDF for: ${documentData.name}
        Document ID: ${documentData.id}
        Language: ${documentData.language}
        Pages: ${documentData.pages}
        
        In a real application, this would be the actual uploaded PDF file.
      `)}`;

      link.href = pdfContent;
      link.download = uploadedFileName || `${documentData.name}_original.pdf`;

      // Create and trigger download
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      console.log("Original PDF download initiated");
    } catch (error) {
      console.error("Error downloading original PDF:", error);
      alert("Error downloading original PDF. Please try again.");
    }
  };

  // Handle Export Report button click
  const handleExportReport = async () => {
    try {
      // Generate PDF report with all tab data
      const reportData = {
        document: documentData, // Fixed: use documentData instead of document
        overview: analysisData?.components?.summary || {
          document_type: "SaaS Terms of Service",
          main_parties: ["CyberArk", "Customer"],
          overview:
            "## SaaS Terms of Service **Main Parties:** CyberArk and Customer **Document:** SaaS Terms of Service This is a Software as a Service (SaaS) Terms of Service agreement between CyberArk Software Ltd. and its customers. It outlines the terms and conditions for accessing and using CyberArk's SaaS products. This agreement is legally binding and covers access, usage restrictions, support, payment, intellectual property, data protection, warranties, indemnification, and termination. **Key Parties:** - **CyberArk:** The provider of the SaaS products and services. They grant access to their software and provide support. - **Customer:** The company or legal entity that will be using the SaaS products. They are responsible for payment, proper usage, and ensuring their authorized users comply with the terms. --- ## Your Main Responsibilities ### Primary Obligations 1. **Access and Use:** You are granted a non-exclusive, non-transferable right to access and use CyberArk's SaaS products and documentation for your internal business purposes.",
        },
        riskAnalysis: analysisData?.components?.risk_assessment || {
          overall_risk_level: "Medium",
          risk_score: 6,
          risk_factors: [
            {
              category: "Payment Terms Risk",
              description:
                "Late payment fees of 1.5% per month may apply to unpaid balances.",
            },
            {
              category: "Data Security Risk",
              description:
                "Customer responsibility for data security and compliance requirements.",
            },
            {
              category: "Service Availability Risk",
              description:
                "Limited warranty protection and potential service interruptions.",
            },
          ],
        },
        keyIssues: analysisData?.components?.key_highlights
          ?.critical_deadlines || [
          {
            title: "Payment Terms",
            description:
              "Invoices are due within thirty (30) days. Late payments subject to 1.5% monthly charge.",
            priority: "High",
          },
          {
            title: "Data Protection Obligations",
            description:
              "Customer must maintain appropriate data security measures and comply with applicable laws.",
            priority: "High",
          },
          {
            title: "Service Level Agreements",
            description:
              "Limited warranty protection with specific procedures for warranty breaches.",
            priority: "Medium",
          },
        ],
        timestamp: new Date().toISOString(),
      };

      // Create and download PDF
      const success = await generatePDFReport(reportData);
      if (success) {
        alert("Report exported successfully!");
      } else {
        alert("Export failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert(
        `Error generating PDF report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Helper function to clean and format text for PDF export
  const cleanTextForPDF = (text: string): string => {
    if (!text) return "";

    return (
      text
        // Remove markdown headers (## ### etc.)
        .replace(/^#{1,6}\s+/gm, "")
        // Remove markdown bold/italic (**text** *text*)
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        // Remove specific patterns from the uploaded image
        .replace(/## SaaS Terms of Service/g, "SaaS Terms of Service")
        .replace(/\*\*Main Parties:\*\*/g, "Main Parties:")
        .replace(/\*\*Document:\*\*/g, "Document:")
        .replace(/\*\*Key Parties:\*\*/g, "Key Parties:")
        .replace(/\*\*([^*]+):\*\*/g, "$1:")
        // Remove excessive dashes and special characters
        .replace(/---+/g, "")
        .replace(/\*\*\*/g, "")
        .replace(/#{2,}/g, "")
        .replace(/\*{3,}/g, "")
        // Clean up specific patterns that cause formatting issues
        .replace(/\s+-{2,}\s+/g, " ")
        .replace(/\.\s*-{2,}\s*/g, ". ")
        // Remove double quotes and replace with single quotes
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        // Clean up excessive whitespace
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        // Remove any remaining special markdown formatting
        .replace(/\[[^\]]*\]/g, "") // Remove [text] patterns
        .replace(/`([^`]+)`/g, "$1") // Remove `code` formatting
        // Final cleanup
        .trim()
    );
  };

  // Helper function to format executive summary content
  const formatExecutiveSummary = (overview: any): string => {
    if (!overview?.overview) {
      return "This document provides a comprehensive analysis of the legal agreement, highlighting key risks, obligations, and critical considerations for all parties involved.";
    }

    console.log("Original overview text:", overview.overview);
    const summary = cleanTextForPDF(overview.overview);
    console.log("Cleaned summary text:", summary);

    // Split into paragraphs for better readability
    const paragraphs = summary
      .split(/\.\s+(?=[A-Z])/)
      .filter((p) => p.trim().length > 20);

    if (paragraphs.length > 1) {
      // Format as multiple paragraphs
      const formatted = paragraphs
        .map((p) => p.trim() + (p.endsWith(".") ? "" : "."))
        .join("</p><p>");
      console.log("Formatted paragraphs:", formatted);
      return formatted;
    }

    return summary;
  };

  // Generate enhanced HTML report with professional styling
  const generateEnhancedHTMLReport = (data: any): string => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Legal Document Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7; 
            color: #1f2937; 
            background: #ffffff;
            font-size: 14px;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 25.4mm 15mm; /* Top/bottom: 1 inch, left/right: 15mm */
            background: white;
            box-sizing: border-box;
        }
        
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white; 
            padding: 40px 30px;
            text-align: center; 
            margin-bottom: 0;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header h1 { 
            font-size: 32px; 
            font-weight: 700;
            margin: 0 0 8px 0;
            position: relative;
            z-index: 1;
        }
        
        .header h2 { 
            font-size: 18px; 
            font-weight: 500;
            margin: 0 0 12px 0;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .header p { 
            font-size: 14px; 
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .section { 
            margin-bottom: 35px; 
            padding: 25px;
            background: #ffffff;
            border: 1px solid #e5e7eb; 
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #3b82f6, #1e40af);
            border-radius: 2px 0 0 2px;
        }
        
        .section h2 { 
            color: #1e40af; 
            font-size: 20px;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 12px;
            margin-bottom: 20px;
            position: relative;
        }
        
        .section h3 { 
            color: #374151; 
            font-size: 16px;
            font-weight: 500;
            margin: 20px 0 12px 0;
        }
        
        .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .metadata-item {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
        }
        
        .metadata-label {
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .metadata-value {
            font-size: 16px;
            color: #1f2937;
            font-weight: 500;
        }
        
        .risk-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .risk-high { 
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        
        .risk-medium { 
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fed7aa;
        }
        
        .risk-low { 
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }
        
        .risk-score-container {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
        }
        
        .risk-score-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: white;
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .risk-factors {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .risk-factor-item {
            margin-bottom: 15px;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border-left: 3px solid #ef4444;
        }
        
        .risk-factor-category {
            font-weight: 600;
            color: #dc2626;
            margin-bottom: 4px;
        }
        
        .issues-list {
            counter-reset: issue-counter;
        }
        
        .executive-summary {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            line-height: 1.8;
            font-size: 15px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .executive-summary p {
            margin: 0 0 15px 0;
            color: #374151;
            text-align: justify;
            hyphens: auto;
            word-break: break-word;
        }
        
        .executive-summary p:last-child {
            margin-bottom: 0;
        }
        
        .issue-item {
            counter-increment: issue-counter;
            margin-bottom: 20px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            position: relative;
        }
        
        .issue-item::before {
            content: counter(issue-counter);
            position: absolute;
            left: -2px;
            top: -2px;
            width: 24px;
            height: 24px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
        }
        
        .issue-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .issue-description {
            color: #4b5563;
            line-height: 1.6;
        }
        
        .priority-high {
            background: #fef2f2;
            border-left-color: #ef4444;
        }
        
        .priority-medium {
            background: #fef3c7;
            border-left-color: #f59e0b;
        }
        
        .priority-low {
            background: #f0fdf4;
            border-left-color: #10b981;
        }
        
        .footer {
            margin-top: 40px;
            padding: 25px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        p {
            margin-bottom: 12px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            text-align: justify;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        li {
            margin-bottom: 8px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        strong {
            font-weight: 600;
            color: #1f2937;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 100%;
                padding: 25.4mm 15mm; /* Standard 1-inch top/bottom margins */
                margin: 0;
            }
            
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 15mm;
                orphans: 3;
                widows: 3;
            }
            
            .header {
                break-after: avoid;
                page-break-after: avoid;
            }
            
            .executive-summary {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .issue-item {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 10mm;
            }
            
            h1, h2, h3 {
                break-after: avoid;
                page-break-after: avoid;
                orphans: 3;
                widows: 3;
            }
            
            p {
                orphans: 3;
                widows: 3;
            }
            
            .footer {
                break-before: auto;
                page-break-before: auto;
                margin-top: 15mm;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Legal Document Analysis Report</h1>
            <h2>${data.document.name}</h2>
            <p>Comprehensive Analysis Report • Generated on ${new Date(
              data.timestamp
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📋 Document Overview</h2>
                <div class="metadata-grid">
                    <div class="metadata-item">
                        <div class="metadata-label">Document Type</div>
                        <div class="metadata-value">${
                          data.overview?.document_type || "Legal Document"
                        }</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Language</div>
                        <div class="metadata-value">${
                          data.document.language
                        }</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Total Pages</div>
                        <div class="metadata-value">${data.document.pages}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">Risk Assessment</div>
                        <div class="metadata-value">
                            <span class="risk-badge risk-${data.document.risk
                              .toLowerCase()
                              .replace(" ", "-")}">${data.document.risk}</span>
                        </div>
                    </div>
                </div>
                
                <h3>Main Parties Involved</h3>
                <p><strong>${
                  data.overview?.main_parties?.join(" • ") || "Not specified"
                }</strong></p>
                
                <h3>Executive Summary</h3>
                <div class="executive-summary">
                    <p>${formatExecutiveSummary(data.overview)}</p>
                </div>
            </div>

            <div class="section">
                <h2>⚠️ Risk Analysis</h2>
                <div class="risk-score-container">
                    <div class="risk-score-circle">
                        ${data.riskAnalysis?.risk_score || "5"}/10
                    </div>
                    <div>
                        <h3>Overall Risk Level: ${
                          data.riskAnalysis?.overall_risk_level || "Medium"
                        }</h3>
                        <p>This assessment reflects the overall legal and financial exposure identified in the document.</p>
                    </div>
                </div>
                
                ${
                  data.riskAnalysis?.risk_factors?.length > 0
                    ? `
                    <div class="risk-factors">
                        <h3>🎯 Key Risk Factors</h3>
                        ${data.riskAnalysis.risk_factors
                          .map(
                            (factor: any) => `
                            <div class="risk-factor-item">
                                <div class="risk-factor-category">${
                                  factor.category || "Risk Factor"
                                }</div>
                                <div>${
                                  factor.description ||
                                  "No description available."
                                }</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="risk-factors">
                        <h3>🎯 Risk Assessment</h3>
                        <div class="risk-factor-item">
                            <div class="risk-factor-category">General Legal Risk</div>
                            <div>Standard legal considerations apply to this type of document. Regular review and compliance monitoring recommended.</div>
                        </div>
                    </div>
                `
                }
            </div>

            <div class="section">
                <h2>📌 Key Issues & Obligations</h2>
                ${
                  data.keyIssues?.length > 0
                    ? `
                    <div class="issues-list">
                        ${data.keyIssues
                          .map(
                            (issue: any, index: number) => `
                            <div class="issue-item ${
                              issue.priority
                                ? `priority-${issue.priority.toLowerCase()}`
                                : ""
                            }">
                                <div class="issue-title">${
                                  issue.title || `Issue ${index + 1}`
                                }</div>
                                <div class="issue-description">${
                                  issue.description ||
                                  "No detailed description available for this issue."
                                }</div>
                                ${
                                  issue.priority
                                    ? `<p><strong>Priority Level:</strong> ${issue.priority}</p>`
                                    : ""
                                }
                                ${
                                  issue.deadline
                                    ? `<p><strong>Deadline:</strong> ${issue.deadline}</p>`
                                    : ""
                                }
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : `
                    <div class="issues-list">
                        <div class="issue-item">
                            <div class="issue-title">Compliance Monitoring</div>
                            <div class="issue-description">Regular review of contractual obligations and compliance requirements is recommended to ensure all parties meet their commitments.</div>
                        </div>
                        <div class="issue-item">
                            <div class="issue-title">Legal Review Schedule</div>
                            <div class="issue-description">Establish periodic legal reviews to address any changes in applicable laws or regulations that may affect this agreement.</div>
                        </div>
                    </div>
                `
                }
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Legal Document Analysis System</strong> • Confidential Report</p>
            <p>This report is generated automatically and should be reviewed by qualified legal counsel.</p>
            <p>Report ID: ${data.document.id} • Generated: ${new Date(
      data.timestamp
    ).toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
    return htmlContent;
  };

  // Enhanced PDF generation with proper formatting using html2canvas + jsPDF
  const generatePDFReport = async (data: any) => {
    try {
      console.log("Starting professional PDF generation...", data);

      // Dynamic imports to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      console.log("Libraries imported successfully");

      // Create a temporary container for the HTML content with proper sizing
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "180mm"; // A4 width minus margins (210mm - 30mm margins)
      tempContainer.style.minHeight = "246.2mm"; // A4 height minus margins (297mm - 50.8mm margins)
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.style.fontFamily =
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      tempContainer.style.padding = "25.4mm 15mm"; // Standard 1-inch top/bottom, 15mm sides
      tempContainer.style.boxSizing = "border-box";

      console.log("Generating professional HTML content...");
      const htmlContent = generateEnhancedHTMLReport(data);
      tempContainer.innerHTML = htmlContent;

      console.log("Adding content to DOM for rendering...");
      document.body.appendChild(tempContainer);

      // Wait a moment for fonts and styles to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Capturing HTML as canvas...");
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // High quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 680, // A4 width minus margins in pixels (180mm at 96 DPI)
        height: undefined, // Auto height
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 680,
        windowHeight: 927, // A4 height minus margins in pixels (246.2mm at 96 DPI)
      });

      console.log("Canvas generated successfully:", {
        width: canvas.width,
        height: canvas.height,
      });

      // Clean up DOM
      document.body.removeChild(tempContainer);

      console.log("Creating PDF document...");
      // Create PDF with proper A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Calculate dimensions for proper scaling with margins
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const marginLeft = 15; // Left margin in mm
      const marginTop = 25.4; // Top margin in mm (1 inch standard)
      const marginRight = 15; // Right margin in mm
      const marginBottom = 25.4; // Bottom margin in mm (1 inch standard)
      const contentWidth = pdfWidth - marginLeft - marginRight; // 180mm
      const contentHeight = pdfHeight - marginTop - marginBottom; // 246.2mm
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      console.log("PDF dimensions calculated:", {
        pdfWidth,
        pdfHeight,
        contentWidth,
        contentHeight,
        imgWidth,
        imgHeight,
        margins: { marginLeft, marginTop, marginRight, marginBottom },
      });

      // Add pages as needed with proper margins
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;

      // First page with margins
      pdf.addImage(
        imgData,
        "PNG",
        marginLeft,
        marginTop + position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= contentHeight;

      // Additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          marginLeft,
          marginTop + position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        heightLeft -= contentHeight;
        pageNum++;
      }

      console.log(`PDF generated with ${pageNum} pages`);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${data.document.name.replace(
        ".pdf",
        ""
      )}_Analysis_Report_${timestamp}.pdf`;

      console.log("Saving PDF:", fileName);
      pdf.save(fileName);

      console.log("PDF generation completed successfully");

      return true;
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      // Simple fallback PDF if HTML conversion fails
      try {
        console.log("Attempting fallback PDF generation...");
        const jsPDF = (await import("jspdf")).default;
        const pdf = new jsPDF();

        // Professional fallback design
        pdf.setFillColor(30, 64, 175); // Blue background
        pdf.rect(0, 0, 210, 40, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("Legal Document Analysis Report", 20, 25);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Document: ${data.document.name}`, 20, 60);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 75);

        pdf.setFontSize(12);
        pdf.text(
          "PDF generation encountered an issue. Please try again.",
          20,
          100
        );
        pdf.text(
          "If the problem persists, contact technical support.",
          20,
          115
        );

        const fileName = `Fallback_Report_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        pdf.save(fileName);

        console.log("Fallback PDF saved successfully");
        return true;
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        throw new Error(
          `PDF generation failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  // Direct PDF generation with proper formatting
  const generateDirectPDF = async (data: any) => {
    try {
      const jsPDF = (await import("jspdf")).default;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Helper functions for better formatting
      const addText = (
        text: string,
        fontSize: number = 12,
        style: string = "normal",
        color: number[] = [0, 0, 0]
      ) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", style);
        return text;
      };

      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number = 12,
        style: string = "normal"
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", style);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * fontSize * 0.4;
      };

      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const addSectionHeader = (title: string, icon: string = "") => {
        checkNewPage(20);

        // Background for section header
        doc.setFillColor(59, 130, 246); // Blue background
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, "F");

        // Section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(icon + " " + title, margin + 5, yPosition + 4);

        yPosition += 15;
        doc.setTextColor(0, 0, 0);
      };

      // Header with blue background
      doc.setFillColor(30, 64, 175); // Dark blue
      doc.rect(0, 0, pageWidth, 50, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Legal Document Analysis Report", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text(data.document.name, pageWidth / 2, 30, { align: "center" });

      doc.setFontSize(12);
      doc.text(
        "Generated on " +
          new Date(data.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        pageWidth / 2,
        40,
        { align: "center" }
      );

      yPosition = 60;

      // Document Metadata Section
      addSectionHeader("📄 Document Metadata");

      // Metadata table background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 40);

      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);

      // Metadata content in two columns
      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 5;

      doc.text("Language:", col1X, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(data.document.language, col1X + 25, yPosition);

      doc.setFont("helvetica", "bold");
      doc.text("Pages:", col2X, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(data.document.pages.toString(), col2X + 20, yPosition);

      yPosition += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Risk Level:", col1X, yPosition);
      doc.setFont("helvetica", "normal");

      // Color-coded risk level
      const riskColor = data.document.risk.includes("HIGH")
        ? [220, 38, 38]
        : data.document.risk.includes("LOW")
        ? [34, 197, 94]
        : [251, 191, 36];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(data.document.risk, col1X + 25, yPosition);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Processing Time:", col2X, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(
        (data.document.processing_time || "N/A") + "s",
        col2X + 35,
        yPosition
      );

      yPosition += 20;

      // Executive Summary Section
      addSectionHeader("📊 Executive Summary");

      doc.setFillColor(240, 249, 255);
      const summaryHeight = 60;
      doc.rect(margin, yPosition, pageWidth - 2 * margin, summaryHeight, "F");
      doc.setDrawColor(186, 230, 253);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, summaryHeight);

      yPosition += 8;

      // Document type and parties
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Document Type:", margin + 5, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(
        data.overview?.document_type || "Not specified",
        margin + 35,
        yPosition,
        pageWidth - 2 * margin - 40,
        11
      );

      yPosition += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Main Parties:", margin + 5, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(
        data.overview?.main_parties?.join(", ") || "Not specified",
        margin + 30,
        yPosition,
        pageWidth - 2 * margin - 35,
        11
      );

      yPosition += 5;
      const summaryText =
        data.overview?.overview || "Executive summary not available.";
      yPosition = addWrappedText(
        summaryText,
        margin + 5,
        yPosition,
        pageWidth - 2 * margin - 10,
        11
      );

      yPosition += 15;

      // Risk Analysis Section
      checkNewPage(60);
      addSectionHeader("⚠️ Risk Analysis");

      doc.setFillColor(254, 242, 242);
      const riskSectionHeight = 50;
      doc.rect(
        margin,
        yPosition,
        pageWidth - 2 * margin,
        riskSectionHeight,
        "F"
      );
      doc.setDrawColor(252, 165, 165);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, riskSectionHeight);

      yPosition += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Overall Risk Level:", margin + 5, yPosition);

      const overallRiskColor = data.riskAnalysis?.overall_risk_level
        ?.toLowerCase()
        .includes("high")
        ? [220, 38, 38]
        : data.riskAnalysis?.overall_risk_level?.toLowerCase().includes("low")
        ? [34, 197, 94]
        : [251, 191, 36];
      doc.setTextColor(
        overallRiskColor[0],
        overallRiskColor[1],
        overallRiskColor[2]
      );
      doc.text(
        data.riskAnalysis?.overall_risk_level || "Medium",
        margin + 45,
        yPosition
      );

      doc.setTextColor(0, 0, 0);
      yPosition += 8;
      doc.text("Risk Score:", margin + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(
        (data.riskAnalysis?.risk_score || "N/A") + "/10",
        margin + 30,
        yPosition
      );

      yPosition += 10;

      // Risk factors with bullet points
      if (data.riskAnalysis?.risk_factors?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Key Risk Factors:", margin + 5, yPosition);
        yPosition += 6;

        data.riskAnalysis.risk_factors.forEach((factor: any, index: number) => {
          checkNewPage(12);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("•", margin + 8, yPosition);
          yPosition = addWrappedText(
            (factor.category || factor.title) + ": " + factor.description,
            margin + 12,
            yPosition,
            pageWidth - 2 * margin - 17,
            10
          );
          yPosition += 3;
        });
      }

      yPosition += 10;

      // Key Issues Section
      checkNewPage(40);
      addSectionHeader("📋 Key Issues & Obligations");

      if (data.keyIssues?.length > 0) {
        data.keyIssues.forEach((issue: any, index: number) => {
          checkNewPage(25);

          // Issue background
          doc.setFillColor(240, 249, 255);
          const issueHeight = 20;
          doc.rect(margin, yPosition, pageWidth - 2 * margin, issueHeight, "F");
          doc.setDrawColor(186, 230, 253);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, issueHeight);

          yPosition += 6;

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 64, 175);
          yPosition = addWrappedText(
            "Issue " + (index + 1) + ": " + (issue.title || "Untitled Issue"),
            margin + 5,
            yPosition,
            pageWidth - 2 * margin - 10,
            12,
            "bold"
          );

          yPosition += 2;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          yPosition = addWrappedText(
            "Description: " +
              (issue.description || "No description available."),
            margin + 8,
            yPosition,
            pageWidth - 2 * margin - 13,
            10
          );

          if (issue.priority) {
            yPosition += 2;
            doc.setFont("helvetica", "bold");
            doc.text("Priority:", margin + 8, yPosition);
            doc.setFont("helvetica", "normal");
            doc.text(issue.priority, margin + 25, yPosition);
          }

          yPosition += 8;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(107, 114, 128);
        doc.text(
          "No key issues or obligations were identified in the document analysis.",
          margin + 5,
          yPosition
        );
        yPosition += 15;
      }

      // Analysis Methodology Section
      checkNewPage(50);
      addSectionHeader("🔬 Analysis Methodology");

      doc.setFillColor(248, 250, 252);
      const methodologyHeight = 60;
      doc.rect(
        margin,
        yPosition,
        pageWidth - 2 * margin,
        methodologyHeight,
        "F"
      );
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, methodologyHeight);

      yPosition += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text("AI-Powered Legal Document Analysis", margin + 5, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(
        "This comprehensive report was generated using advanced artificial intelligence algorithms specifically designed for legal document analysis:",
        margin + 5,
        yPosition,
        pageWidth - 2 * margin - 10,
        10
      );
      yPosition += 5;

      const methodologyPoints = [
        "Automated risk assessment based on contract terms, clauses, and legal precedents",
        "Key issue identification and categorization by priority and impact level",
        "Executive summary generation with document type classification",
        "Performance metrics analysis and processing time optimization",
        "Comprehensive obligation and deadline extraction with party assignment",
        "Multi-layer analysis with confidence scoring and quality assessment",
      ];

      methodologyPoints.forEach((point) => {
        checkNewPage(8);
        doc.text("✓", margin + 8, yPosition);
        yPosition = addWrappedText(
          point,
          margin + 12,
          yPosition,
          pageWidth - 2 * margin - 17,
          9
        );
        yPosition += 3;
      });

      // Disclaimer
      yPosition += 5;
      checkNewPage(20);
      doc.setFillColor(255, 243, 199);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, "F");
      doc.setDrawColor(251, 191, 36);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 15);

      yPosition += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(146, 64, 14);
      doc.text("Important Disclaimer:", margin + 5, yPosition);
      yPosition += 3;
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(
        "This analysis is generated by artificial intelligence and is intended for informational purposes only. While our AI system uses sophisticated legal analysis algorithms, this report should be reviewed by qualified legal professionals before making any critical business or legal decisions.",
        margin + 5,
        yPosition,
        pageWidth - 2 * margin - 10,
        9
      );

      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(
          "Page " + i + " of " + totalPages,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
        doc.text(
          "Generated by Legal Document Analyzer",
          margin,
          pageHeight - 10
        );
      }

      // Save the PDF
      doc.save(data.document.name.replace(".pdf", "") + "_Analysis_Report.pdf");
    } catch (error) {
      console.error("Error generating direct PDF:", error);
      alert("Error generating PDF report. Please try again.");
    }
  };

  // Use real data from backend or fallback to mock data
  const documentData = {
    id: documentId,
    name:
      uploadedFileName ||
      analysisData?.metadata?.filename ||
      "Employment Agreement - John Smith.pdf",
    pages: analysisData?.metadata?.document_metadata?.pages || 15,
    language: "English",
    analyzedDate: new Date().toISOString().slice(0, 16).replace("T", " "),
    readTime: analysisData?.performance?.total_time
      ? analysisData.performance.total_time + "s"
      : "2.3 minutes",
    risk: determineRiskLevel(analysisData),
    processing_time: analysisData?.performance?.total_time,
    target_achieved: analysisData?.performance?.target_achieved,
    // Add URL for PDF viewing - would come from backend in real app
    url: "/test_sample.pdf", // Demo PDF for testing
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

      {/* Document Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-3 font-space-grotesk">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToDashboard}
                  className="text-muted-foreground hover:text-foreground mx-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
                {documentData.name}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span style={{marginLeft:'30px'}}>{documentData.language}</span>
                <span>Analyzed {documentData.analyzedDate}</span>

                {/* Performance indicators */}
                {analysisData?.performance && (
                  <>
                    <span
                      className={
                        "flex items-center " +
                        (documentData.target_achieved
                          ? "text-green-600"
                          : "text-orange-600")
                      }
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {documentData.target_achieved ? "⚡ Fast" : "⏱️ Normal"}
                    </span>
                  </>
                )}

                {/* Processing performance info */}
                {analysisData?.performance && (
                  <span>
                    Processing: {analysisData.performance.total_time}s
                    {analysisData.performance.target_achieved && (
                      <span className="text-green-600 ml-2">
                        ✓ Under 20s target
                      </span>
                    )}
                  </span>
                )}

                <Badge className={"ml-4 " + getRiskColor(documentData.risk)}>
                  {documentData.risk}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* <Button variant="outline" size="sm" onClick={handleViewOriginal}>
                <Eye className="h-4 w-4 mr-2" />
                View Original
              </Button> */}
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleAskAI}
              >
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
          <TabsList className="grid w-full grid-cols-4 mb-q">
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

      {/* PDF Viewer Popup */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              View Original Document - {documentData.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              {documentData.url ? (
                <div className="w-full h-full">
                  <iframe
                    src={documentData.url}
                    className="w-full h-full border-0 rounded-lg"
                    title={`PDF Viewer - ${documentData.name}`}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PDF Viewer
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Original document: {documentData.name}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    PDF URL not available. You can download the original
                    document instead.
                  </p>
                  <div className="mt-6 space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPdfViewer(false)}
                    >
                      Close
                    </Button>
                    <Button onClick={handleDownloadOriginal}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Original
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
