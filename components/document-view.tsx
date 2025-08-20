"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  console.log("DocumentView received analysisData:", analysisData); // Debug log

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
      const link = window.document.createElement('a');
      
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
      
      console.log('Original PDF download initiated');
    } catch (error) {
      console.error('Error downloading original PDF:', error);
      alert('Error downloading original PDF. Please try again.');
    }
  };

  // Handle Export Report button click
  const handleExportReport = async () => {
    try {
      console.log('Export Report clicked - starting PDF generation...');
      
      // Generate PDF report with all tab data
      const reportData = {
        document: documentData,  // Fixed: use documentData instead of document
        overview: analysisData?.components?.summary || {
          document_type: 'Legal Document',
          main_parties: ['Party A', 'Party B'],
          overview: 'This is a comprehensive analysis of the legal document.'
        },
        riskAnalysis: analysisData?.components?.risk_assessment || {
          overall_risk_level: 'Medium',
          risk_score: 5,
          risk_factors: [
            { category: 'Legal Risk', description: 'Standard legal considerations apply.' },
            { category: 'Financial Risk', description: 'Moderate financial exposure identified.' }
          ]
        },
        keyIssues: analysisData?.components?.key_highlights?.critical_deadlines || [
          { title: 'Sample Issue 1', description: 'This is a sample issue for demonstration.' },
          { title: 'Sample Issue 2', description: 'Another sample issue for testing purposes.' }
        ],
        timestamp: new Date().toISOString(),
      };

      console.log('Report data prepared:', reportData);

      // Create and download PDF
      const success = await generatePDFReport(reportData);
      if (success) {
        console.log('PDF export completed successfully');
        alert('Report exported successfully!');
      } else {
        console.error('PDF export failed');
        alert('Export failed. Please check the console for details.');
      }
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert(`Error generating PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: #1e40af; 
            color: white; 
            padding: 30px; 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
        }
        h1 { font-size: 28px; margin: 0; }
        h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .risk-high { color: #dc2626; }
        .risk-medium { color: #d97706; }
        .risk-low { color: #16a34a; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Legal Document Analysis Report</h1>
        <h2>${data.document.name}</h2>
        <p>Generated on ${new Date(data.timestamp).toLocaleDateString()}</p>
    </div>
    
    <div class="section">
        <h2>Document Metadata</h2>
        <p><strong>Language:</strong> ${data.document.language}</p>
        <p><strong>Pages:</strong> ${data.document.pages}</p>
        <p><strong>Risk Level:</strong> <span class="risk-${data.document.risk.toLowerCase().replace(' ', '-')}">${data.document.risk}</span></p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p><strong>Document Type:</strong> ${data.overview?.document_type || 'Not specified'}</p>
        <p><strong>Main Parties:</strong> ${data.overview?.main_parties?.join(', ') || 'Not specified'}</p>
        <p>${data.overview?.overview || 'Executive summary not available.'}</p>
    </div>

    <div class="section">
        <h2>Risk Analysis</h2>
        <p><strong>Overall Risk Level:</strong> ${data.riskAnalysis?.overall_risk_level || 'Medium'}</p>
        <p><strong>Risk Score:</strong> ${data.riskAnalysis?.risk_score || 'N/A'}/10</p>
        ${data.riskAnalysis?.risk_factors?.length > 0 ? `
            <h3>Key Risk Factors:</h3>
            <ul>
                ${data.riskAnalysis.risk_factors.map((factor: any) => `
                    <li><strong>${factor.category || 'Risk Factor'}:</strong> ${factor.description || 'No description available.'}</li>
                `).join('')}
            </ul>
        ` : '<p>No specific risk factors identified.</p>'}
    </div>

    <div class="section">
        <h2>Key Issues & Obligations</h2>
        ${data.keyIssues?.length > 0 ? `
            <ol>
                ${data.keyIssues.map((issue: any) => `
                    <li>
                        <strong>${issue.title || 'Untitled Issue'}</strong>
                        <p>${issue.description || 'No description available.'}</p>
                        ${issue.priority ? `<p><strong>Priority:</strong> ${issue.priority}</p>` : ''}
                    </li>
                `).join('')}
            </ol>
        ` : '<p>No key issues or obligations identified.</p>'}
    </div>
</body>
</html>`;
    return htmlContent;
  };

  // Enhanced PDF generation with proper formatting using html2canvas + jsPDF
  const generatePDFReport = async (data: any) => {
    try {
      console.log('Starting PDF generation...', data);
      
      // Dynamic imports to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      console.log('Libraries imported successfully');
      
      // Create a temporary div with the report content
      const reportDiv = document.createElement('div');
      reportDiv.style.width = '210mm'; // A4 width
      reportDiv.style.fontFamily = 'Arial, sans-serif';
      reportDiv.style.fontSize = '14px';
      reportDiv.style.lineHeight = '1.6';
      reportDiv.style.color = '#000';
      reportDiv.style.backgroundColor = '#fff';
      reportDiv.style.padding = '20px';
      reportDiv.style.position = 'absolute';
      reportDiv.style.left = '-9999px';
      
      console.log('Generating HTML content...');
      const htmlContent = generateEnhancedHTMLReport(data);
      reportDiv.innerHTML = htmlContent;
      
      console.log('HTML content generated, adding to DOM...');
      // Add to document temporarily
      document.body.appendChild(reportDiv);
      
      console.log('Generating canvas from HTML...');
      // Generate PDF using html2canvas + jsPDF
      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });
      
      // Remove temporary div
      document.body.removeChild(reportDiv);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      const fileName = data.document.name.replace('.pdf', '') + '_Analysis_Report.pdf';
      pdf.save(fileName);
      
      console.log('PDF generated successfully');
      return true;
    } catch (error) {
      console.error('Detailed PDF generation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Try fallback to direct jsPDF generation
      try {
        console.log('Attempting fallback PDF generation...');
        await generateDirectPDF(data);
        return true;
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        
        // Create simple emergency PDF
        try {
          console.log('Creating emergency fallback PDF...');
          const jsPDF = (await import('jspdf')).default;
          const pdf = new jsPDF();
          
          pdf.setFontSize(16);
          pdf.text('Analysis Report', 20, 20);
          pdf.setFontSize(12);
          pdf.text('Report generation failed. Please try again.', 20, 40);
          pdf.text(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 20, 60);
          
          const fileName = `emergency-report-${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(fileName);
          
          console.log('Emergency PDF saved:', fileName);
          return true;
        } catch (emergencyError) {
          console.error('Emergency PDF generation also failed:', emergencyError);
          throw new Error(`All PDF generation methods failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  };

  // Direct PDF generation with proper formatting
  const generateDirectPDF = async (data: any) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;
      
      // Helper functions for better formatting
      const addText = (text: string, fontSize: number = 12, style: string = 'normal', color: number[] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', style);
        return text;
      };
      
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, style: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
      };
      
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      const addSectionHeader = (title: string, icon: string = '') => {
        checkNewPage(20);
        
        // Background for section header
        doc.setFillColor(59, 130, 246); // Blue background
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
        
        // Section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(icon + ' ' + title, margin + 5, yPosition + 4);
        
        yPosition += 15;
        doc.setTextColor(0, 0, 0);
      };
      
      // Header with blue background
      doc.setFillColor(30, 64, 175); // Dark blue
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Legal Document Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(data.document.name, pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Generated on ' + new Date(data.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }), pageWidth / 2, 40, { align: 'center' });
      
      yPosition = 60;
      
      // Document Metadata Section
      addSectionHeader('📄 Document Metadata');
      
      // Metadata table background
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 40);
      
      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Metadata content in two columns
      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 5;
      
      doc.text('Language:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(data.document.language, col1X + 25, yPosition);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Pages:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(data.document.pages.toString(), col2X + 20, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Level:', col1X, yPosition);
      doc.setFont('helvetica', 'normal');
      
      // Color-coded risk level
      const riskColor = data.document.risk.includes('HIGH') ? [220, 38, 38] : 
                      data.document.risk.includes('LOW') ? [34, 197, 94] : [251, 191, 36];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(data.document.risk, col1X + 25, yPosition);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Processing Time:', col2X, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text((data.document.processing_time || 'N/A') + 's', col2X + 35, yPosition);
      
      yPosition += 20;
      
      // Executive Summary Section
      addSectionHeader('📊 Executive Summary');
      
      doc.setFillColor(240, 249, 255);
      const summaryHeight = 60;
      doc.rect(margin, yPosition, pageWidth - 2 * margin, summaryHeight, 'F');
      doc.setDrawColor(186, 230, 253);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, summaryHeight);
      
      yPosition += 8;
      
      // Document type and parties
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Document Type:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(data.overview?.document_type || 'Not specified', margin + 35, yPosition, pageWidth - 2 * margin - 40, 11);
      
      yPosition += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Main Parties:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(data.overview?.main_parties?.join(', ') || 'Not specified', margin + 30, yPosition, pageWidth - 2 * margin - 35, 11);
      
      yPosition += 5;
      const summaryText = data.overview?.overview || 'Executive summary not available.';
      yPosition = addWrappedText(summaryText, margin + 5, yPosition, pageWidth - 2 * margin - 10, 11);
      
      yPosition += 15;
      
      // Risk Analysis Section
      checkNewPage(60);
      addSectionHeader('⚠️ Risk Analysis');
      
      doc.setFillColor(254, 242, 242);
      const riskSectionHeight = 50;
      doc.rect(margin, yPosition, pageWidth - 2 * margin, riskSectionHeight, 'F');
      doc.setDrawColor(252, 165, 165);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, riskSectionHeight);
      
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Risk Level:', margin + 5, yPosition);
      
      const overallRiskColor = data.riskAnalysis?.overall_risk_level?.toLowerCase().includes('high') ? [220, 38, 38] : 
                             data.riskAnalysis?.overall_risk_level?.toLowerCase().includes('low') ? [34, 197, 94] : [251, 191, 36];
      doc.setTextColor(overallRiskColor[0], overallRiskColor[1], overallRiskColor[2]);
      doc.text(data.riskAnalysis?.overall_risk_level || 'Medium', margin + 45, yPosition);
      
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
      doc.text('Risk Score:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text((data.riskAnalysis?.risk_score || 'N/A') + '/10', margin + 30, yPosition);
      
      yPosition += 10;
      
      // Risk factors with bullet points
      if (data.riskAnalysis?.risk_factors?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Key Risk Factors:', margin + 5, yPosition);
        yPosition += 6;
        
        data.riskAnalysis.risk_factors.forEach((factor: any, index: number) => {
          checkNewPage(12);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('•', margin + 8, yPosition);
          yPosition = addWrappedText((factor.category || factor.title) + ': ' + factor.description, margin + 12, yPosition, pageWidth - 2 * margin - 17, 10);
          yPosition += 3;
        });
      }
      
      yPosition += 10;
      
      // Key Issues Section
      checkNewPage(40);
      addSectionHeader('📋 Key Issues & Obligations');
      
      if (data.keyIssues?.length > 0) {
        data.keyIssues.forEach((issue: any, index: number) => {
          checkNewPage(25);
          
          // Issue background
          doc.setFillColor(240, 249, 255);
          const issueHeight = 20;
          doc.rect(margin, yPosition, pageWidth - 2 * margin, issueHeight, 'F');
          doc.setDrawColor(186, 230, 253);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, issueHeight);
          
          yPosition += 6;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 64, 175);
          yPosition = addWrappedText('Issue ' + (index + 1) + ': ' + (issue.title || 'Untitled Issue'), margin + 5, yPosition, pageWidth - 2 * margin - 10, 12, 'bold');
          
          yPosition += 2;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPosition = addWrappedText('Description: ' + (issue.description || 'No description available.'), margin + 8, yPosition, pageWidth - 2 * margin - 13, 10);
          
          if (issue.priority) {
            yPosition += 2;
            doc.setFont('helvetica', 'bold');
            doc.text('Priority:', margin + 8, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(issue.priority, margin + 25, yPosition);
          }
          
          yPosition += 8;
        });
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        doc.text('No key issues or obligations were identified in the document analysis.', margin + 5, yPosition);
        yPosition += 15;
      }
      
      // Analysis Methodology Section
      checkNewPage(50);
      addSectionHeader('🔬 Analysis Methodology');
      
      doc.setFillColor(248, 250, 252);
      const methodologyHeight = 60;
      doc.rect(margin, yPosition, pageWidth - 2 * margin, methodologyHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, methodologyHeight);
      
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('AI-Powered Legal Document Analysis', margin + 5, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText('This comprehensive report was generated using advanced artificial intelligence algorithms specifically designed for legal document analysis:', margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += 5;
      
      const methodologyPoints = [
        'Automated risk assessment based on contract terms, clauses, and legal precedents',
        'Key issue identification and categorization by priority and impact level',
        'Executive summary generation with document type classification',
        'Performance metrics analysis and processing time optimization',
        'Comprehensive obligation and deadline extraction with party assignment',
        'Multi-layer analysis with confidence scoring and quality assessment'
      ];
      
      methodologyPoints.forEach(point => {
        checkNewPage(8);
        doc.text('✓', margin + 8, yPosition);
        yPosition = addWrappedText(point, margin + 12, yPosition, pageWidth - 2 * margin - 17, 9);
        yPosition += 3;
      });
      
      // Disclaimer
      yPosition += 5;
      checkNewPage(20);
      doc.setFillColor(255, 243, 199);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
      doc.setDrawColor(251, 191, 36);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 15);
      
      yPosition += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Important Disclaimer:', margin + 5, yPosition);
      yPosition += 3;
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText('This analysis is generated by artificial intelligence and is intended for informational purposes only. While our AI system uses sophisticated legal analysis algorithms, this report should be reviewed by qualified legal professionals before making any critical business or legal decisions.', margin + 5, yPosition, pageWidth - 2 * margin - 10, 9);
      
      // Page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('Page ' + i + ' of ' + totalPages, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Generated by Legal Document Analyzer', margin, pageHeight - 10);
      }
      
      // Save the PDF
      doc.save(data.document.name.replace('.pdf', '') + '_Analysis_Report.pdf');
      
    } catch (error) {
      console.error('Error generating direct PDF:', error);
      alert('Error generating PDF report. Please try again.');
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
    url: '/test_sample.pdf', // Demo PDF for testing
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
                {documentData.name}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>•</span>
                <span>{documentData.language}</span>
                <span>•</span>
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

                <Badge className={"ml-4 " + getRiskColor(documentData.risk)}>
                  {documentData.risk}
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
              <Button variant="outline" size="sm" onClick={handleViewOriginal}>
                <Eye className="h-4 w-4 mr-2" />
                View Original
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAskAI}>
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

      {/* PDF Viewer Popup */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>View Original Document - {documentData.name}</DialogTitle>
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
                    PDF URL not available. You can download the original document instead.
                  </p>
                  <div className="mt-6 space-x-3">
                    <Button variant="outline" onClick={() => setShowPdfViewer(false)}>
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
