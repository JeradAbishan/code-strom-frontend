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
} from "lucide-react";
import {
  DocumentAnalysisResponse,
  transformBackendDataForFrontend,
} from "@/lib/api";

interface Obligation {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  party: string;
  priority: string;
  category: string;
  status: string;
}

interface ObligationsTabProps {
  analysisData?: DocumentAnalysisResponse | null;
}

export function ObligationsTab({ analysisData }: ObligationsTabProps) {
  // Only use real backend data - no fallbacks to mock data
  console.log("ObligationsTab received analysisData:", analysisData); // Debug log

  const highlightsData = analysisData?.components?.key_highlights
    ? transformBackendDataForFrontend.keyHighlights(
        analysisData.components.key_highlights
      )
    : null;

  // Only show data if we have real backend data
  if (!analysisData || !highlightsData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No obligations data available. Please upload and process a document
            first.
          </p>
        </div>
      </div>
    );
  }

  const obligations = highlightsData.critical_deadlines || [];

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "payment":
        return "bg-blue-50 text-blue-700";
      case "delivery":
        return "bg-green-50 text-green-700";
      case "review":
        return "bg-purple-50 text-purple-700";
      case "renewal":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-space-grotesk">
                Key Obligations & Deadlines
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Critical deadlines and obligations identified in this document
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button variant="outline" size="sm">
                All Categories
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Obligations List */}
      <div className="space-y-4">
        {obligations.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No critical deadlines found in the backend analysis.
              </p>
            </CardContent>
          </Card>
        ) : (
          obligations.map((obligation: Obligation) => {
            const daysUntil = getDaysUntilDue(obligation.dueDate);
            const isOverdue = daysUntil < 0;
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;

            return (
              <Card
                key={obligation.id}
                className={`bg-card border-border ${
                  isOverdue
                    ? "border-red-200"
                    : isUrgent
                    ? "border-yellow-200"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isOverdue
                              ? "bg-red-500"
                              : isUrgent
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <h3 className="text-lg font-semibold text-foreground font-space-grotesk">
                          {obligation.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {obligation.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due:{" "}
                            {new Date(obligation.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{obligation.party}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {isOverdue
                              ? `${Math.abs(daysUntil)} days overdue`
                              : daysUntil === 0
                              ? "Due today"
                              : `${daysUntil} days remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getPriorityColor(obligation.priority)}>
                        {obligation.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(obligation.category)}
                      >
                        {obligation.category}
                      </Badge>
                      {isOverdue && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <Bell className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                      {isUrgent && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Bell className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-space-grotesk">
            Obligation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {obligations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Obligations
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {
                  obligations.filter(
                    (o: Obligation) => getDaysUntilDue(o.dueDate) < 0
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  obligations.filter((o: Obligation) => {
                    const days = getDaysUntilDue(o.dueDate);
                    return days <= 7 && days >= 0;
                  }).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Due This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  obligations.filter(
                    (o: Obligation) => o.priority?.toUpperCase() === "HIGH"
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {highlightsData.action_items &&
        highlightsData.action_items.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-space-grotesk">
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highlightsData.action_items.map(
                  (action: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{action}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
