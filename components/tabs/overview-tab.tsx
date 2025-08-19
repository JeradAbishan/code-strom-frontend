import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  DocumentAnalysisResponse,
  transformBackendDataForFrontend,
} from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "highlight.js/styles/github.css";

interface MetricItem {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: string;
  progress: number;
}

interface OverviewTabProps {
  analysisData?: DocumentAnalysisResponse | null;
}

export function OverviewTab({ analysisData }: OverviewTabProps) {
  // Only use real backend data - no fallbacks to mock data
  console.log("OverviewTab received analysisData:", analysisData); // Debug log

  const summaryData = analysisData?.components?.summary
    ? transformBackendDataForFrontend.summary(analysisData.components.summary)
    : null;

  const confidenceData = analysisData?.components?.confidence_metrics
    ? transformBackendDataForFrontend.confidenceMetrics(
        analysisData.components.confidence_metrics
      )
    : null;

  // Only show data if we have real backend data
  if (!analysisData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Document Analysis Available
          </h3>
          <p className="text-muted-foreground">
            Please upload and process a document to see the analysis overview.
          </p>
        </div>
      </div>
    );
  }

  // Create metrics from real backend data only
  const metrics: MetricItem[] = [];

  if (summaryData?.metrics) {
    metrics.push(
      {
        title: "AI Confidence",
        value: `${summaryData.metrics.ai_confidence}%`,
        subtitle: "Analysis reliability",
        icon: TrendingUp,
        color: "text-blue-600",
        progress: summaryData.metrics.ai_confidence,
      },
      {
        title: "Risk Score",
        value: `${summaryData.metrics.risk_score}/10`,
        subtitle: "Moderate attention needed",
        icon: Shield,
        color:
          summaryData.metrics.risk_score >= 7
            ? "text-red-600"
            : summaryData.metrics.risk_score >= 4
            ? "text-yellow-600"
            : "text-green-600",
        progress: summaryData.metrics.risk_score * 10,
      },
      {
        title: "Compliance",
        value: `${summaryData.metrics.compliance_score}%`,
        subtitle:
          summaryData.metrics.compliance_score >= 80
            ? "Above average"
            : "Below average",
        icon: CheckCircle,
        color: "text-green-600",
        progress: summaryData.metrics.compliance_score,
      },
      {
        title: "Critical Issues",
        value: `${summaryData.metrics.critical_issues}`,
        subtitle:
          summaryData.metrics.critical_issues > 0
            ? "Immediate action required"
            : "No critical issues",
        icon: AlertTriangle,
        color:
          summaryData.metrics.critical_issues > 0
            ? "text-red-600"
            : "text-green-600",
        progress: Math.min(summaryData.metrics.critical_issues * 25, 100),
      },
      {
        title: "Obligations",
        value: `${summaryData.metrics.total_obligations}`,
        subtitle: "Key deadlines tracked",
        icon: Calendar,
        color: "text-purple-600",
        progress: Math.min(summaryData.metrics.total_obligations * 20, 100),
      }
    );
  }

  const positiveAspects = summaryData?.positive_aspects || [];
  const areasOfConcern = summaryData?.areas_of_concern || [];
  const recommendedActions = confidenceData?.recommendations || [];

  // Get the overview content - this is the main summary from backend
  const overviewContent =
    summaryData?.overview ||
    analysisData?.components?.summary?.overview ||
    "No executive summary available from the backend analysis.";

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((metric: MetricItem, index: number) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.subtitle}
                  </p>
                  <Progress value={metric.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Executive Summary - Main Backend Summary Content */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="bg-blue-50 border-l-4 border-l-blue-600 py-4">
          <CardTitle className="flex items-center gap-3 text-gray-800 text-xl font-bold">
            <FileText className="h-6 w-6 text-blue-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <div className="bg-blue-50 border-l-4 border-l-blue-600 p-4 mb-6 rounded-r-lg">
                    <h1 className="text-xl font-bold text-gray-800 m-0">
                      {children}
                    </h1>
                  </div>
                ),
                h2: ({ children }) => (
                  <div className="bg-blue-50 border-l-4 border-l-blue-600 p-3 mb-4 mt-6 rounded-r-lg">
                    <h2 className="text-lg font-semibold text-gray-800 m-0">
                      {children}
                    </h2>
                  </div>
                ),
                h3: ({ children }) => (
                  <div className="bg-gray-50 border-l-4 border-l-gray-400 p-3 mb-3 mt-4 rounded-r-lg">
                    <h3 className="text-base font-semibold text-gray-700 m-0">
                      {children}
                    </h3>
                  </div>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-medium text-gray-700 mb-2 mt-3">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                ol: ({ children }) => (
                  <ol
                    className="space-y-2 mb-4 ml-6"
                    style={{ listStyleType: "decimal" }}
                  >
                    {children}
                  </ol>
                ),
                ul: ({ children }) => (
                  <ul
                    className="space-y-2 mb-4 ml-6"
                    style={{ listStyleType: "disc" }}
                  >
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 leading-relaxed pl-2">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-800">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <span className="italic text-blue-800 font-medium">
                    {children}
                  </span>
                ),
                // Custom mark tag handler for selective highlighting
                mark: ({ children, className }: any) => {
                  const markClass = className || "";
                  const text = children?.toString() || "";

                  // Critical legal terms that need immediate attention (red highlighting)
                  if (
                    text.toLowerCase().includes("auto-renewal") ||
                    text.toLowerCase().includes("automatic renewal") ||
                    text.toLowerCase().includes("auto renew") ||
                    text.toLowerCase().includes("automatically renew") ||
                    text.toLowerCase().includes("penalty") ||
                    text.toLowerCase().includes("termination fee") ||
                    text.toLowerCase().includes("cancellation fee") ||
                    text.toLowerCase().includes("breach") ||
                    text.toLowerCase().includes("default") ||
                    text.toLowerCase().includes("liquidated damages") ||
                    markClass.includes("high-risk")
                  ) {
                    return (
                      <span className="bg-red-100 text-red-900 px-2 py-1 rounded font-semibold border border-red-300">
                        {children}
                      </span>
                    );
                  }

                  // Important legal terms (blue highlighting)
                  if (
                    markClass.includes("legal-term") ||
                    text.toLowerCase().includes("clause") ||
                    text.toLowerCase().includes("section") ||
                    text.toLowerCase().includes("provision") ||
                    text.toLowerCase().includes("liability") ||
                    text.toLowerCase().includes("indemnification") ||
                    text.toLowerCase().includes("intellectual property") ||
                    text.toLowerCase().includes("confidentiality") ||
                    text.toLowerCase().includes("non-disclosure") ||
                    text.toLowerCase().includes("governing law") ||
                    text.toLowerCase().includes("jurisdiction") ||
                    text.toLowerCase().includes("arbitration") ||
                    text.toLowerCase().includes("force majeure")
                  ) {
                    return (
                      <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-semibold border border-blue-300">
                        📋 {children}
                      </span>
                    );
                  }

                  // Financial terms (green highlighting)
                  else if (
                    markClass.includes("financial") ||
                    text.toLowerCase().includes("cost") ||
                    text.toLowerCase().includes("fee") ||
                    text.toLowerCase().includes("payment") ||
                    text.toLowerCase().includes("amount") ||
                    text.toLowerCase().includes("price") ||
                    text.toLowerCase().includes("subscription") ||
                    text.toLowerCase().includes("invoice") ||
                    text.toLowerCase().includes("billing") ||
                    text.toLowerCase().includes("refund")
                  ) {
                    return (
                      <span className="bg-green-100 text-green-900 px-2 py-1 rounded font-semibold border border-green-300">
                        💰 {children}
                      </span>
                    );
                  }

                  // Deadline/time-sensitive terms (orange highlighting)
                  else if (
                    markClass.includes("deadline") ||
                    text.toLowerCase().includes("deadline") ||
                    text.toLowerCase().includes("due date") ||
                    text.toLowerCase().includes("expiry") ||
                    text.toLowerCase().includes("expires") ||
                    text.toLowerCase().includes("notice period") ||
                    text.toLowerCase().includes("days notice") ||
                    text.toLowerCase().includes("30 days") ||
                    text.toLowerCase().includes("60 days") ||
                    text.toLowerCase().includes("90 days")
                  ) {
                    return (
                      <span className="bg-orange-100 text-orange-900 px-2 py-1 rounded font-semibold border border-orange-300">
                        ⏰ {children}
                      </span>
                    );
                  }

                  // Medium risk terms (yellow highlighting)
                  else if (
                    text.toLowerCase().includes("medium risk") ||
                    text.toLowerCase().includes("moderate") ||
                    text.toLowerCase().includes("caution") ||
                    text.toLowerCase().includes("limitation of liability") ||
                    text.toLowerCase().includes("disclaimer") ||
                    text.toLowerCase().includes("warranty exclusion")
                  ) {
                    return (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold border border-yellow-300">
                        ⚡ {children}
                      </span>
                    );
                  }

                  // Low risk/positive terms (light green highlighting)
                  else if (
                    text.toLowerCase().includes("low risk") ||
                    text.toLowerCase().includes("compliant") ||
                    text.toLowerCase().includes("acceptable") ||
                    text.toLowerCase().includes("standard terms") ||
                    text.toLowerCase().includes("reasonable") ||
                    text.toLowerCase().includes("fair")
                  ) {
                    return (
                      <span className="bg-green-50 text-green-800 px-2 py-1 rounded font-medium border border-green-200">
                        ✅ {children}
                      </span>
                    );
                  } else {
                    // Default mark styling for general highlighting
                    return (
                      <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-medium">
                        {children}
                      </span>
                    );
                  }
                },
                hr: () => <hr className="my-6 border-t-2 border-gray-200" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-4 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return isInline ? (
                    <code
                      className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
                      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium">
                        <span className="font-semibold">Contract Language</span>
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
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <table className="w-full table-fixed">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200">{children}</tbody>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 break-words">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-700 break-words">
                    {children}
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
                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors duration-200 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {overviewContent}
            </ReactMarkdown>

            {/* Simple notice for critical information */}
            {(overviewContent.includes("High-Risk") ||
              overviewContent.includes("Critical") ||
              overviewContent.includes("Auto-Renewal")) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Critical terms require attention
                  </span>
                </div>
              </div>
            )}

            {/* Simple notice for financial terms */}
            {(overviewContent.includes("Payment") ||
              overviewContent.includes("Fee") ||
              overviewContent.includes("Penalty")) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Review financial obligations carefully
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Backend Data Sections */}
          {(positiveAspects.length > 0 || areasOfConcern.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Positive Aspects */}
              {positiveAspects.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Positive Aspects
                  </h3>
                  <div className="space-y-2">
                    {positiveAspects.map((aspect: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-800">{aspect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas of Concern */}
              {areasOfConcern.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Areas of Concern
                  </h3>
                  <div className="space-y-2">
                    {areasOfConcern.map(
                      (
                        concern: { text: string; risk: string } | string,
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex items-start justify-between"
                        >
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800">
                              {typeof concern === "string"
                                ? concern
                                : concern.text}
                            </span>
                          </div>
                          {typeof concern === "object" && concern.risk && (
                            <Badge
                              className={
                                concern.risk === "High Risk"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {concern.risk}
                            </Badge>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      {recommendedActions.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-3">
              {recommendedActions.map((action: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
