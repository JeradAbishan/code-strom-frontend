import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle, FileText, ExternalLink, TrendingUp } from "lucide-react"

export function RiskAnalysisTab() {
  const risks = [
    {
      id: 1,
      title: "Unilateral Termination Clause",
      type: "LEGAL",
      severity: "HIGH SEVERITY",
      section: "Section 4.2 - Termination",
      description:
        "Contract allows one party to terminate without 7 days notice, posing significant risk to business continuity.",
      impact: "Could lead to sudden contract termination and significant financial losses.",
      recommendation: "Consider requiring mutual agreement or longer notice period (30-90 days) to protect interests.",
      confidence: 92,
    },
    {
      id: 2,
      title: "Unlimited Liability Exposure",
      type: "FINANCIAL",
      severity: "HIGH SEVERITY",
      section: "Section 7.1 - Indemnification",
      description:
        "No cap on liability damages which could result in significant financial exposure for unexpected claims.",
      impact: "Potential unlimited financial liability for damages, leading to severe financial strain or bankruptcy.",
      recommendation: "Add liability cap equal to contract value or a reasonable fixed amount to limit financial risk.",
      confidence: 89,
    },
    {
      id: 3,
      title: "Broad Non-Compete Clause",
      type: "OPERATIONAL",
      severity: "MEDIUM SEVERITY",
      section: "Section 9.3 - Restrictive Covenants",
      description:
        "Non-compete restriction covers entire industry for 2 years post-termination, potentially hindering future growth.",
      impact: "May restrict future business opportunities significantly, impacting strategic diversification.",
      recommendation:
        "Limit scope to specific services or geographic area to allow reasonable post-termination activity.",
      confidence: 85,
    },
    {
      id: 4,
      title: "Ambiguous Dispute Resolution",
      type: "LEGAL",
      severity: "MEDIUM SEVERITY",
      section: "Section 12.4 - Dispute Resolution",
      description:
        "Dispute resolution mechanism is unclear and may lead to procedural confusion and prolonged litigation.",
      impact: "Potential delays and increased costs in dispute resolution, escalating legal expenses.",
      recommendation:
        "Specify clear arbitration or mediation procedures for efficient and cost-effective conflict resolution.",
      confidence: 78,
    },
    {
      id: 5,
      title: "Vague Intellectual Property Rights",
      type: "LEGAL",
      severity: "LOW SEVERITY",
      section: "Section 6.1 - Intellectual Property",
      description:
        "Intellectual property rights are not explicitly defined, potentially leading to ownership disputes.",
      impact: "Risk of future legal challenges over ownership and usage of developed intellectual property.",
      recommendation:
        "Clearly delineate ownership and usage rights for all intellectual property generated under the contract.",
      confidence: 95,
    },
  ]

  const summaryRisks = [
    { clause: "Force Majeure Event Definition", section: "Section 10.1", confidence: 91 },
    { clause: "Confidentiality Obligations", section: "Section 8.3", confidence: 88 },
    { clause: "Governing Law Jurisdiction", section: "Section 16.2", confidence: 84 },
    { clause: "Service Level Agreement", section: "Appendix A", confidence: 80 },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH SEVERITY":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM SEVERITY":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW SEVERITY":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "LEGAL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "FINANCIAL":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "OPERATIONAL":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Confidence Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-space-grotesk">AI Confidence</h3>
              <p className="text-3xl font-bold text-primary font-space-grotesk">89%</p>
              <p className="text-sm text-muted-foreground">Analysis reliability</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                All Types
              </Button>
              <Button variant="outline" size="sm">
                All Severity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis List */}
      <div className="space-y-6">
        {risks.map((risk) => (
          <Card key={risk.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground font-space-grotesk">{risk.title}</h3>
                    <Badge className={getTypeColor(risk.type)}>{risk.type}</Badge>
                    <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{risk.description}</p>
                </div>
                <span className="text-lg font-bold text-muted-foreground">#{risk.id}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Found in:</p>
                      <p className="text-sm text-muted-foreground">{risk.section}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Potential Impact:</p>
                      <p className="text-sm text-muted-foreground">{risk.impact}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">AI Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{risk.recommendation}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">AI Confidence:</p>
                      <span className="text-sm font-medium text-primary">{risk.confidence}%</span>
                    </div>
                    <Progress value={risk.confidence} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View in Document
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary of Risk Clauses */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk">Summary of Risk Clauses</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick overview of identified clauses and AI confidence levels.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryRisks.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.clause}</p>
                  <p className="text-sm text-muted-foreground">{item.section}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.confidence}%</p>
                    <Progress value={item.confidence} className="h-2 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
