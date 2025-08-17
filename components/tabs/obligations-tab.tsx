import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, Bell, CheckCircle, ChevronDown } from "lucide-react"

export function ObligationsTab() {
  const obligations = [
    {
      id: 1,
      title: "Initial Payment Due",
      description: "First installment of $50,000 due upon contract execution",
      dueDate: "2025-01-25",
      party: "Client",
      priority: "HIGH",
      category: "Payment",
      status: "pending",
    },
    {
      id: 2,
      title: "Service Delivery Milestone",
      description: "Complete Phase 1 deliverables and documentation",
      dueDate: "2025-02-15",
      party: "Contractor",
      priority: "HIGH",
      category: "Delivery",
      status: "pending",
    },
    {
      id: 3,
      title: "Quarterly Review Meeting",
      description: "Conduct performance review and assessment meeting",
      dueDate: "2025-03-31",
      party: "Both Parties",
      priority: "MEDIUM",
      category: "Review",
      status: "pending",
    },
    {
      id: 4,
      title: "Compliance Audit",
      description: "Submit compliance documentation and undergo audit",
      dueDate: "2025-04-30",
      party: "Contractor",
      priority: "MEDIUM",
      category: "Compliance",
      status: "pending",
    },
    {
      id: 5,
      title: "Contract Renewal Discussion",
      description: "Initiate discussion for contract renewal terms and conditions",
      dueDate: "2025-05-10",
      party: "Legal Team",
      priority: "LOW",
      category: "Legal",
      status: "pending",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Payment":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Delivery":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Review":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Compliance":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "Legal":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date()
    const dueDate = new Date(dateString)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-space-grotesk">Obligations & Timeline</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Key obligations, deadlines, and responsible parties</p>
            </div>
            <Button variant="outline" size="sm">
              All Categories
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Obligations List */}
      <div className="space-y-4">
        {obligations.map((obligation) => {
          const daysUntil = getDaysUntilDue(obligation.dueDate)
          const isOverdue = daysUntil < 0
          const isUrgent = daysUntil <= 7 && daysUntil >= 0

          return (
            <Card
              key={obligation.id}
              className={`bg-card border-border ${isOverdue ? "border-red-200" : isUrgent ? "border-yellow-200" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground font-space-grotesk">{obligation.title}</h3>
                      {isOverdue && <Badge className="bg-red-100 text-red-800 border-red-200">OVERDUE</Badge>}
                      {isUrgent && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">URGENT</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{obligation.description}</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Due:</p>
                          <p className="font-medium text-foreground">{formatDate(obligation.dueDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Party:</p>
                          <p className="font-medium text-foreground">{obligation.party}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-muted-foreground">Priority:</p>
                          <Badge className={getPriorityColor(obligation.priority)}>{obligation.priority}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-muted-foreground">Category:</p>
                          <Badge className={getCategoryColor(obligation.category)}>{obligation.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </div>

                {(isOverdue || isUrgent) && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${isOverdue ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-yellow-500"}`} />
                      <p className={`text-sm font-medium ${isOverdue ? "text-red-800" : "text-yellow-800"}`}>
                        {isOverdue
                          ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""}`
                          : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
