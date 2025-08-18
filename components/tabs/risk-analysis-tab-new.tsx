import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import {
  DocumentAnalysisResponse,
  transformBackendDataForFrontend,
} from "@/lib/api";

interface Risk {
  id: number;
  title: string;
  type: string;
  severity: string;
  section: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
}

interface RiskAnalysisTabProps {
  analysisData?: DocumentAnalysisResponse | null;
}

export function RiskAnalysisTab({ analysisData }: RiskAnalysisTabProps) {
  // Only use real backend data - no fallbacks to mock data
  console.log("RiskAnalysisTab received analysisData:", analysisData); // Debug log

  const riskData = analysisData?.components?.risk_assessment
    ? transformBackendDataForFrontend.riskAssessment(
        analysisData.components.risk_assessment
      )
    : null;

  // Only show data if we have real backend data
  if (!analysisData || !riskData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No risk analysis data available. Please upload and process a
            document first.
          </p>
        </div>
      </div>
    );
  }

  const risks = [
    ...(riskData.critical_risks || []),
    ...(riskData.moderate_risks || []),
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH SEVERITY":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM SEVERITY":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FINANCIAL":
        return "bg-red-50 text-red-700";
      case "LEGAL":
        return "bg-blue-50 text-blue-700";
      case "OPERATIONAL":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Risk Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-space-grotesk">
                Risk Assessment Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analysis of potential risks and concerns identified in this
                document
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {risks.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Risks</div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {risks.filter((r) => r.severity === "HIGH SEVERITY").length}
              </div>
              <div className="text-sm text-muted-foreground">High Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {risks.filter((r) => r.severity === "MEDIUM SEVERITY").length}
              </div>
              <div className="text-sm text-muted-foreground">
                Medium Severity
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {risks.filter((r) => r.severity === "LOW SEVERITY").length}
              </div>
              <div className="text-sm text-muted-foreground">Low Severity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis List */}
      <div className="space-y-6">
        {risks.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No specific risks identified in the backend analysis.
              </p>
            </CardContent>
          </Card>
        ) : (
          risks.map((risk: Risk) => (
            <Card key={risk.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-foreground font-space-grotesk">
                        {risk.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getTypeColor(risk.type)}
                      >
                        {risk.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {risk.section}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Confidence
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={risk.confidence}
                          className="h-2 w-16"
                        />
                        <span className="text-sm font-medium">
                          {risk.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {risk.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Potential Impact
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {risk.impact}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {risk.recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Risk Mitigation Recommendations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk">
            Overall Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Risk Level
              </h4>
              <p className="text-sm text-muted-foreground">
                {riskData.overall_risk_level
                  ? `Overall Risk Level: ${riskData.overall_risk_level}`
                  : "Risk level not determined"}
              </p>
            </div>
            {riskData.analysis && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Analysis Summary
                </h4>
                <p className="text-sm text-muted-foreground">
                  {riskData.analysis}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
