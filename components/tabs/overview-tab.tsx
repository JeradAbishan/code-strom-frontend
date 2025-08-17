import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, CheckCircle, AlertTriangle, Calendar, HelpCircle } from "lucide-react"

export function OverviewTab() {
  const metrics = [
    {
      title: "AI Confidence",
      value: "89%",
      subtitle: "Analysis reliability",
      icon: TrendingUp,
      color: "text-blue-600",
      progress: 89,
    },
    {
      title: "Risk Score",
      value: "6.5/10",
      subtitle: "Moderate attention needed",
      icon: Shield,
      color: "text-yellow-600",
      progress: 65,
    },
    {
      title: "Compliance",
      value: "85%",
      subtitle: "Above average",
      icon: CheckCircle,
      color: "text-green-600",
      progress: 85,
    },
    {
      title: "Critical Issues",
      value: "2",
      subtitle: "Immediate action required",
      icon: AlertTriangle,
      color: "text-red-600",
      progress: 20,
    },
    {
      title: "Obligations",
      value: "4",
      subtitle: "Key deadlines tracked",
      icon: Calendar,
      color: "text-purple-600",
      progress: 75,
    },
  ]

  const positiveAspects = [
    "Competitive compensation package ($125,000 + benefits)",
    "Clear intellectual property assignment terms",
    "Standard confidentiality and data protection clauses",
    "Annual performance review and salary adjustment",
  ]

  const areasOfConcern = [
    { text: "Unilateral termination with 7-day notice", risk: "High Risk" },
    { text: "Unlimited liability exposure", risk: "High Risk" },
    { text: "Broad 2-year non-compete clause", risk: "Medium Risk" },
    { text: "Unclear dispute resolution process", risk: "Medium Risk" },
  ]

  const recommendedActions = [
    "Request 30-90 day notice period and mutual agreement requirement",
    "Limit liability to contract value or annual compensation",
    "Limit to specific services, geographic area, or reduce duration",
    "Specify arbitration procedures and governing law",
  ]

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground font-space-grotesk">{metric.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                <Progress value={metric.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Executive Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            This employment agreement represents a{" "}
            <strong className="text-foreground">standard senior-level contract</strong> with several areas requiring
            attention. The document establishes clear compensation structures and benefits but contains{" "}
            <strong className="text-foreground">moderate to high risk factors</strong> that should be negotiated before
            signing.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Positive Aspects */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 font-space-grotesk">Positive Aspects</h3>
              <div className="space-y-3">
                {positiveAspects.map((aspect, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas of Concern */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 font-space-grotesk">Areas of Concern</h3>
              <div className="space-y-3">
                {areasOfConcern.map((concern, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{concern.text}</span>
                    </div>
                    <Badge
                      className={
                        concern.risk === "High Risk"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {concern.risk}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-foreground">{action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
