"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  ExternalLink,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { DocumentAnalysisResponse, RiskAssessment } from "@/lib/api";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "highlight.js/styles/github.css";

interface EnhancedRiskAnalysisTabProps {
  analysisData?: DocumentAnalysisResponse | null;
}

export function EnhancedRiskAnalysisTab({
  analysisData,
}: EnhancedRiskAnalysisTabProps) {
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

  // Extract risk data from the actual backend response - only use real data
  const riskData = analysisData?.components?.risk_assessment;

  console.log("Risk Assessment Data:", riskData); // Debug log to verify real data

  if (!analysisData || !riskData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No risk analysis data available
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please upload and process a document to view risk analytics
          </p>
        </div>
      </div>
    );
  }

  // Check if we have real extracted data (not mock/null values)
  const hasRealData = {
    overall_risk_level:
      riskData.overall_risk_level && riskData.overall_risk_level !== "",
    risk_score: riskData.risk_score && riskData.risk_score > 0,
    critical_risks:
      riskData.critical_risks && riskData.critical_risks.length > 0,
    moderate_risks:
      riskData.moderate_risks && riskData.moderate_risks.length > 0,
    liability_concerns:
      riskData.liability_concerns && riskData.liability_concerns.length > 0,
    financial_penalties:
      riskData.financial_penalties && riskData.financial_penalties.length > 0,
    analysis: riskData.analysis && riskData.analysis.trim() !== "",
  };

  // Get risk score from summary metrics (should match risk assessment)
  const summaryMetrics = analysisData?.components?.summary?.metrics;
  const riskScoreFromSummary = summaryMetrics?.risk_score;

  // ALWAYS use risk_assessment as the authoritative source for consistency
  const consistentRiskScore = riskData.risk_score || riskScoreFromSummary || 0;

  const getRiskSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "HIGH SEVERITY":
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM SEVERITY":
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW SEVERITY":
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "FINANCIAL":
        return <DollarSign className="h-4 w-4" />;
      case "LEGAL":
        return <Shield className="h-4 w-4" />;
      case "OPERATIONAL":
        return <Users className="h-4 w-4" />;
      case "COMPLIANCE":
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const overallRiskLevel = hasRealData.overall_risk_level
    ? riskData.overall_risk_level?.toUpperCase()
    : null;
  const riskScore = hasRealData.risk_score ? consistentRiskScore : null;
  const criticalRisks = hasRealData.critical_risks
    ? riskData.critical_risks
    : [];
  const moderateRisks = hasRealData.moderate_risks
    ? riskData.moderate_risks
    : [];
  const allRisks = [...criticalRisks, ...moderateRisks];

  return (
    <div className="space-y-8">
      {/* Overall Risk Assessment - Only show if real data exists */}
      {(hasRealData.overall_risk_level || hasRealData.risk_score) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* {hasRealData.overall_risk_level && overallRiskLevel && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  Overall Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge 
                    className={`text-lg px-4 py-2 ${getRiskSeverityColor(overallRiskLevel)}`}
                  >
                    {overallRiskLevel} RISK
                  </Badge>
                  {hasRealData.risk_score && riskScore !== null && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Risk Score</span>
                        <span className={`font-bold text-lg ${getRiskScoreColor(riskScore)}`}>
                          {riskScore}/10
                        </span>
                      </div>
                      <Progress 
                        value={(riskScore / 10) * 100} 
                        className="h-3"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )} */}

          {hasRealData.risk_score &&
            riskScore !== null &&
            !hasRealData.overall_risk_level && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
                    Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Score
                      </span>
                      <span
                        className={`font-bold text-2xl ${getRiskScoreColor(
                          riskScore
                        )}`}
                      >
                        {riskScore}/10
                      </span>
                    </div>
                    <Progress value={(riskScore / 10) * 100} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* Risk Distribution - Only show if there are risks */}
      {allRisks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical Risks</span>
                  <Badge variant="destructive">{criticalRisks.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moderate Risks</span>
                  <Badge variant="secondary">{moderateRisks.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Issues</span>
                  <Badge variant="outline">{allRisks.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Only show if additional data exists */}
          {(hasRealData.liability_concerns ||
            hasRealData.financial_penalties ||
            (riskData &&
              riskData.red_flags &&
              riskData.red_flags.length > 0)) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Additional Concerns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskData && riskData.red_flags && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Red Flags</span>
                      <span className="font-semibold text-red-600">
                        {riskData.red_flags.length}
                      </span>
                    </div>
                  )}
                  {hasRealData.financial_penalties &&
                    riskData &&
                    riskData.financial_penalties && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Financial Penalties</span>
                        <span className="font-semibold text-orange-600">
                          {riskData.financial_penalties.length}
                        </span>
                      </div>
                    )}
                  {hasRealData.liability_concerns &&
                    riskData &&
                    riskData.liability_concerns && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Liability Concerns</span>
                        <span className="font-semibold text-purple-600">
                          {riskData.liability_concerns.length}
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Critical Risks Section */}
      {criticalRisks.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <XCircle className="h-6 w-6 mr-2 text-red-500" />
              Critical Risks ({criticalRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalRisks.map((risk, index) => (
                <div
                  key={risk.id || index}
                  className="border rounded-lg p-4 bg-red-50 border-red-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getRiskTypeIcon(risk.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-red-900">
                          {risk.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            className={getRiskSeverityColor(risk.severity)}
                          >
                            {risk.severity}
                          </Badge>
                          <Badge variant="outline">{risk.type}</Badge>
                          {risk.section && (
                            <Badge variant="secondary" className="text-xs">
                              {risk.section}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {risk.confidence && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Confidence
                          </div>
                          <div className="font-semibold">
                            {risk.confidence}%
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRisk(
                            expandedRisk === (risk.id || index)
                              ? null
                              : risk.id || index
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-red-800 mb-3">
                    {risk.description}
                  </p>

                  {expandedRisk === (risk.id || index) && (
                    <div className="space-y-3 border-t border-red-200 pt-3">
                      {risk.impact && (
                        <div>
                          <h5 className="font-medium text-red-900 mb-1">
                            Impact:
                          </h5>
                          <p className="text-sm text-red-800">{risk.impact}</p>
                        </div>
                      )}
                      {risk.recommendation && (
                        <div>
                          <h5 className="font-medium text-red-900 mb-1">
                            Recommendation:
                          </h5>
                          <p className="text-sm text-red-800">
                            {risk.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderate Risks Section */}
      {moderateRisks.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertCircle className="h-6 w-6 mr-2 text-yellow-500" />
              Moderate Risks ({moderateRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moderateRisks.map((risk, index) => (
                <div
                  key={risk.id || index}
                  className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getRiskTypeIcon(risk.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900">
                          {risk.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            className={getRiskSeverityColor(risk.severity)}
                          >
                            {risk.severity}
                          </Badge>
                          <Badge variant="outline">{risk.type}</Badge>
                          {risk.section && (
                            <Badge variant="secondary" className="text-xs">
                              {risk.section}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {risk.confidence && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Confidence
                          </div>
                          <div className="font-semibold">
                            {risk.confidence}%
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRisk(
                            expandedRisk === (risk.id || index)
                              ? null
                              : risk.id || index
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-yellow-800 mb-3">
                    {risk.description}
                  </p>

                  {expandedRisk === (risk.id || index) && (
                    <div className="space-y-3 border-t border-yellow-200 pt-3">
                      {risk.impact && (
                        <div>
                          <h5 className="font-medium text-yellow-900 mb-1">
                            Impact:
                          </h5>
                          <p className="text-sm text-yellow-800">
                            {risk.impact}
                          </p>
                        </div>
                      )}
                      {risk.recommendation && (
                        <div>
                          <h5 className="font-medium text-yellow-900 mb-1">
                            Recommendation:
                          </h5>
                          <p className="text-sm text-yellow-800">
                            {risk.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Risk Information - Only show if data exists */}
      {(hasRealData.liability_concerns ||
        hasRealData.financial_penalties ||
        (riskData && riskData.red_flags && riskData.red_flags.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Red Flags */}
          {riskData && riskData.red_flags && riskData.red_flags.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Red Flags That Need Immediate Attention (
                  {riskData.red_flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <ul className="space-y-3">
                  {riskData.red_flags.map((flag, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <span>{children}</span>,
                            strong: ({ children }) => (
                              <span className="font-bold text-red-700">
                                {children}
                              </span>
                            ),
                            // Custom mark tag handler for selective highlighting
                            mark: ({ children, className }: any) => {
                              const markClass = className || "";
                              if (markClass.includes("legal-term")) {
                                return (
                                  <span className="bg-red-200 text-red-900 px-1 py-0.5 rounded font-semibold">
                                    {children}
                                  </span>
                                );
                              } else if (markClass.includes("financial")) {
                                return (
                                  <span className="bg-green-200 text-green-900 px-1 py-0.5 rounded font-bold">
                                    {children}
                                  </span>
                                );
                              } else if (markClass.includes("deadline")) {
                                return (
                                  <span className="bg-orange-200 text-orange-900 px-1 py-0.5 rounded font-semibold">
                                    {children}
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="bg-yellow-100 text-yellow-900 px-1 py-0.5 rounded">
                                    {children}
                                  </span>
                                );
                              }
                            },
                          }}
                        >
                          {flag}
                        </ReactMarkdown>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Financial Penalties */}
          {hasRealData.financial_penalties &&
            riskData &&
            riskData.financial_penalties &&
            riskData.financial_penalties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
                    Financial Penalties ({riskData.financial_penalties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {riskData.financial_penalties.map((penalty, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <span>{children}</span>,
                              strong: ({ children }) => (
                                <span className="font-bold text-orange-700">
                                  {children}
                                </span>
                              ),
                            }}
                          >
                            {penalty}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Liability Concerns */}
          {hasRealData.liability_concerns &&
            riskData &&
            riskData.liability_concerns &&
            riskData.liability_concerns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="h-5 w-5 mr-2 text-purple-500" />
                    Liability Concerns ({riskData.liability_concerns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {riskData.liability_concerns.map((concern, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <span>{children}</span>,
                              strong: ({ children }) => (
                                <span className="font-bold text-purple-700">
                                  {children}
                                </span>
                              ),
                            }}
                          >
                            {concern}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* Detailed Risk Analysis - Only show if real analysis exists */}
      {hasRealData.analysis && riskData && riskData.analysis && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              Detailed Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none bg-white rounded-lg p-6 shadow-sm border">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <div className="border-b-2 border-gradient-to-r from-blue-500 to-purple-500 pb-3 mb-6">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {children}
                      </h1>
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="flex items-center space-x-3 my-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {children}
                      </h2>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 my-4 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
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
                    <span className="italic text-blue-800 font-medium">
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
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 my-5 border border-gray-200 shadow-sm">
                      <ul className="space-y-4 list-none">{children}</ul>
                    </div>
                  ),
                  ol: ({ children, ...props }) => (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 my-5 border border-blue-200 shadow-sm">
                      <ol
                        className="space-y-4 [&>li]:list-decimal [&>li]:list-inside [&>li]:pl-2"
                        style={{ listStyleType: "decimal" }}
                        {...props}
                      >
                        {children}
                      </ol>
                    </div>
                  ),
                  li: ({ children, ...props }: any) => {
                    const parentElement = props.node?.parent;
                    const isOrderedList = parentElement?.tagName === "ol";

                    if (isOrderedList) {
                      // For ordered lists, use native browser numbering
                      return (
                        <li
                          className="text-gray-700 text-sm leading-relaxed py-1 ml-0"
                          style={{
                            display: "list-item",
                            listStyleType: "decimal",
                          }}
                          {...props}
                        >
                          <span className="font-medium">{children}</span>
                        </li>
                      );
                    } else {
                      // For unordered lists, use custom bullet
                      return (
                        <li
                          className="text-gray-700 flex items-start text-sm leading-relaxed py-1"
                          {...props}
                        >
                          <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm"></span>
                          <span className="flex-1 font-medium">{children}</span>
                        </li>
                      );
                    }
                  },
                  blockquote: ({ children }) => (
                    <div className="border-l-4 border-red-400 bg-red-50 p-4 my-4 rounded-r-lg">
                      <div className="text-red-800 flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
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
                        className="bg-gradient-to-r from-gray-100 to-blue-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-mono border border-gray-300 shadow-sm font-semibold"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 px-6 py-3 text-sm font-medium flex items-center justify-between">
                          <span className="font-semibold">
                            Contract Language
                          </span>
                          <span className="text-gray-400 text-xs uppercase tracking-wider">
                            {match[1] || "Text"}
                          </span>
                        </div>
                        <SyntaxHighlighter
                          style={oneLight as any}
                          language={match[1] || "text"}
                          PreTag="div"
                          className="!bg-gray-50 !rounded-none !border-0 !text-sm !p-4"
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
                  // Add custom components for better visual hierarchy
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors duration-200 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {riskData.analysis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
