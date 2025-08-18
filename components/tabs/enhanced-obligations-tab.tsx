"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Clock,
  Bell,
  CheckCircle,
  ChevronDown,
  DollarSign,
  AlertTriangle,
  FileText,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  DocumentAnalysisResponse,
  CriticalDeadline,
  FinancialObligation,
} from "@/lib/api";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "highlight.js/styles/github.css";

interface EnhancedObligationsTabProps {
  analysisData?: DocumentAnalysisResponse | null;
}

export function EnhancedObligationsTab({
  analysisData,
}: EnhancedObligationsTabProps) {
  const [expandedObligation, setExpandedObligation] = useState<number | null>(
    null
  );

  // Extract highlights data from the actual backend response - only use real data
  const highlightsData = analysisData?.components?.key_highlights;

  console.log("Obligations Data:", highlightsData); // Debug log to verify real data

  if (!analysisData || !highlightsData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No obligations data available
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please upload and process a document to view obligations and
            deadlines
          </p>
        </div>
      </div>
    );
  }

  // Check if we have real extracted data (not mock/null values)
  const hasRealData = {
    critical_deadlines:
      highlightsData.critical_deadlines &&
      highlightsData.critical_deadlines.length > 0,
    financial_obligations:
      highlightsData.financial_obligations &&
      highlightsData.financial_obligations.length > 0,
    auto_renewal_clause:
      highlightsData.auto_renewal_clause &&
      (highlightsData.auto_renewal_clause.exists ||
        highlightsData.auto_renewal_clause.renewal_period ||
        highlightsData.auto_renewal_clause.notice_required),
    termination_procedures:
      highlightsData.termination_procedures &&
      highlightsData.termination_procedures.length > 0,
    key_restrictions:
      highlightsData.key_restrictions &&
      highlightsData.key_restrictions.length > 0,
    action_items:
      highlightsData.action_items && highlightsData.action_items.length > 0,
    analysis: highlightsData.analysis && highlightsData.analysis.trim() !== "",
  };

  // Get metrics from summary (should match obligations metrics)
  const summaryMetrics = analysisData?.components?.summary?.metrics;
  const totalObligationsFromSummary = summaryMetrics?.total_obligations;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
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

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "payment":
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "legal":
        return <Shield className="h-4 w-4" />;
      case "compliance":
        return <FileText className="h-4 w-4" />;
      case "operational":
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Only use real data from backend
  const criticalDeadlines = hasRealData.critical_deadlines
    ? highlightsData.critical_deadlines
    : [];
  const financialObligations = hasRealData.financial_obligations
    ? highlightsData.financial_obligations
    : [];
  const autoRenewalClause = hasRealData.auto_renewal_clause
    ? highlightsData.auto_renewal_clause
    : null;
  const terminationProcedures = hasRealData.termination_procedures
    ? highlightsData.termination_procedures
    : [];
  const keyRestrictions = hasRealData.key_restrictions
    ? highlightsData.key_restrictions
    : [];
  const actionItems = hasRealData.action_items
    ? highlightsData.action_items
    : [];

  const totalObligations =
    criticalDeadlines.length + financialObligations.length;
  const highPriorityCount = [
    ...criticalDeadlines,
    ...financialObligations,
  ].filter((item) => item.priority?.toUpperCase() === "HIGH").length;

  return (
    <div className="space-y-8">
      {/* Overview Cards - Only show if we have any real obligations data */}
      {(hasRealData.critical_deadlines ||
        hasRealData.financial_obligations) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Total Obligations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalObligations}
              </div>
              <p className="text-sm text-muted-foreground">
                Critical deadlines & financial obligations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {highPriorityCount}
              </div>
              <p className="text-sm text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                Auto-Renewal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {autoRenewalClause && autoRenewalClause.exists ? (
                  <span className="text-orange-600">YES</span>
                ) : (
                  <span className="text-green-600">NO</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic renewal clause
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {actionItems.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended actions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Deadlines - Only show if real data exists */}
      {criticalDeadlines.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="h-6 w-6 mr-2 text-red-500" />
              Critical Deadlines ({criticalDeadlines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalDeadlines.map((deadline, index) => (
                <div
                  key={deadline.id || index}
                  className="border rounded-lg p-4 bg-red-50 border-red-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getCategoryIcon(deadline.category)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-red-900">
                          {deadline.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            className={getPriorityColor(deadline.priority)}
                          >
                            {deadline.priority} Priority
                          </Badge>
                          <Badge variant="outline">{deadline.category}</Badge>
                          {deadline.party && (
                            <Badge variant="secondary" className="text-xs">
                              {deadline.party}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deadline.dueDate && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Due Date
                          </div>
                          <div className="font-semibold text-red-700">
                            {deadline.dueDate}
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedObligation(
                            expandedObligation === (deadline.id || index)
                              ? null
                              : deadline.id || index
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-red-800 mb-3">
                    {deadline.description}
                  </p>

                  {expandedObligation === (deadline.id || index) && (
                    <div className="space-y-3 border-t border-red-200 pt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-red-900">
                            Responsible Party:
                          </span>
                          <span className="ml-2 text-red-800">
                            {deadline.party || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-900">
                            Category:
                          </span>
                          <span className="ml-2 text-red-800">
                            {deadline.category || "General"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Obligations */}
      {financialObligations.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-6 w-6 mr-2 text-green-500" />
              Financial Obligations ({financialObligations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialObligations.map((obligation, index) => (
                <div
                  key={obligation.id || index}
                  className="border rounded-lg p-4 bg-green-50 border-green-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-4 w-4 text-green-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-green-900">
                          {obligation.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            className={getPriorityColor(obligation.priority)}
                          >
                            {obligation.priority} Priority
                          </Badge>
                          <Badge variant="outline">{obligation.category}</Badge>
                          {obligation.party && (
                            <Badge variant="secondary" className="text-xs">
                              {obligation.party}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {obligation.amount && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Amount
                          </div>
                          <div className="font-semibold text-green-700">
                            {obligation.amount}
                          </div>
                        </div>
                      )}
                      {obligation.due_date && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Due Date
                          </div>
                          <div className="font-semibold text-green-700">
                            {obligation.due_date}
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedObligation(
                            expandedObligation === (obligation.id || index)
                              ? null
                              : obligation.id || index
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-green-800">
                    {obligation.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Renewal Information */}
      {autoRenewalClause && autoRenewalClause.exists && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="h-6 w-6 mr-2 text-orange-500" />
              Auto-Renewal Clause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Automatic Renewal Detected
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-orange-900">
                        Renewal Period:
                      </span>
                      <div className="text-orange-800">
                        {autoRenewalClause?.renewal_period || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-orange-900">
                        Notice Required:
                      </span>
                      <div className="text-orange-800">
                        {autoRenewalClause?.notice_required || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-orange-900">
                        Automatic:
                      </span>
                      <div className="text-orange-800">
                        {autoRenewalClause?.automatic ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Termination Procedures */}
        {terminationProcedures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Termination Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {terminationProcedures.map((procedure, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {procedure}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key Restrictions */}
        {keyRestrictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Key Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {keyRestrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {restriction}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
              Recommended Action Items ({actionItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionItems.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-green-50 border-green-200"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-green-800">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Obligations Analysis - Only show if real analysis exists */}
      {hasRealData.analysis && highlightsData && highlightsData.analysis && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-6 w-6 mr-2 text-green-500" />
              Detailed Obligations Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none bg-white rounded-lg p-6 shadow-sm border">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <div className="border-b-2 border-gradient-to-r from-green-500 to-blue-500 pb-3 mb-6">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {children}
                      </h1>
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="flex items-center space-x-3 my-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
                      <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {children}
                      </h2>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 my-4 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {children}
                      </h3>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm font-normal tracking-wide">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <span className="font-bold text-gray-900">{children}</span>
                  ),
                  em: ({ children }) => (
                    <span className="italic text-green-800 font-medium">
                      {children}
                    </span>
                  ),
                  // Custom mark tag handler for selective highlighting
                  mark: ({ children, className }: any) => {
                    const markClass = className || "";
                    if (markClass.includes("legal-term")) {
                      return (
                        <span className="bg-red-100 text-red-900 px-2 py-1 rounded-md border border-red-200 font-semibold">
                          {children}
                        </span>
                      );
                    } else if (markClass.includes("financial")) {
                      return (
                        <span className="bg-green-100 text-green-900 px-2 py-1 rounded-md border border-green-200 font-bold">
                          {children}
                        </span>
                      );
                    } else if (markClass.includes("deadline")) {
                      return (
                        <span className="bg-orange-100 text-orange-900 px-2 py-1 rounded-md border border-orange-200 font-semibold">
                          {children}
                        </span>
                      );
                    } else {
                      // Default mark styling for general highlighting
                      return (
                        <span className="bg-yellow-100 text-yellow-900 px-1 py-0.5 rounded">
                          {children}
                        </span>
                      );
                    }
                  },
                  ul: ({ children }) => (
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 my-4 border border-gray-200 shadow-sm">
                      <ul className="space-y-3">{children}</ul>
                    </div>
                  ),
                  ol: ({ children }) => (
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 my-4 border border-blue-200 shadow-sm">
                      <ol className="space-y-3">{children}</ol>
                    </div>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 flex items-start text-sm leading-relaxed">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-sm"></span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <div className="border-l-4 border-green-400 bg-green-50 p-4 my-4 rounded-r-lg">
                      <div className="text-green-800 flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-sm leading-relaxed font-medium">
                          {children}
                        </div>
                      </div>
                    </div>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return isInline ? (
                      <code
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm font-mono border border-gray-200"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="my-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
                        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-xs font-medium flex items-center justify-between">
                          <span>Code</span>
                          <span className="text-gray-400">{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                          style={oneLight as any}
                          language={match[1]}
                          PreTag="div"
                          className="!bg-gray-50 !rounded-none !border-0 !text-sm"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  pre: ({ children }) => (
                    <div className="bg-gray-50 rounded-lg p-4 my-4 border border-gray-200 overflow-x-auto">
                      <pre className="text-sm text-gray-800 font-mono">
                        {children}
                      </pre>
                    </div>
                  ),
                  hr: () => (
                    <div className="my-6">
                      <div className="h-px bg-gray-200"></div>
                    </div>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                      <table
                        className="w-full table-fixed divide-y divide-gray-200"
                        style={{ tableLayout: "fixed" }}
                      >
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-white divide-y divide-gray-100">
                      {children}
                    </tbody>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 w-1/2">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 last:border-r-0 break-words w-1/2">
                      <div className="min-w-0 break-words overflow-hidden">
                        {children}
                      </div>
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                      {children}
                    </tr>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-green-600 hover:text-green-800 underline decoration-green-300 hover:decoration-green-500 transition-colors duration-200 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {highlightsData.analysis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
