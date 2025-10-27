import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Bot, TrendingUp, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-light to-accent py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
              <span className="text-2xl font-bold text-primary-foreground">AI</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Asset Intelligence Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Advanced AI/ML-driven insights for predictive maintenance, benchmarking, 
              and intelligent asset management.
            </p>
            <Button asChild size="lg" className="mr-4">
              <Link to="/asset-intelligence/predictive-risk">
                Enter Asset Intelligence <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/asset-intelligence/copilot">
                Try AI Copilot
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive Asset Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful modules to transform your maintenance operations with AI-driven insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/asset-intelligence/predictive-risk">
                <CardHeader>
                  <div className="w-12 h-12 bg-destructive-light rounded-lg flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Prescriptive Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI-powered prescriptive maintenance with action plans, scheduling, and parts management.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/asset-intelligence/repair-replace">
                <CardHeader>
                  <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Repair vs Replace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cost-benefit analysis and prescriptive recommendations for optimal asset decisions.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/asset-intelligence/benchmarking">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Performance Benchmarking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compare your KPIs against industry peers with actionable improvement recommendations.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/asset-intelligence/asset-library">
                <CardHeader>
                  <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Asset Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cost comparisons, lifecycle analysis, and comprehensive asset specifications with energy insights.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/asset-intelligence/copilot">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    AI Copilot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    GenAI assistant for technicians and planners with natural language queries and insights.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer bg-primary-light border-primary/20">
              <Link to="/asset-intelligence/predictive-risk">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <ArrowRight className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Start Exploring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Jump into the Asset Intelligence platform and start optimizing your maintenance operations.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-muted py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for Modern Maintenance Teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explainable AI</h3>
              <p className="text-muted-foreground">
                Every prediction comes with clear explanations and risk drivers you can act on.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Filtering</h3>
              <p className="text-muted-foreground">
                Filter by site, asset type, risk level, and more to focus on what matters most.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Export Everything</h3>
              <p className="text-muted-foreground">
                Export any view to CSV, Excel, or PDF for reporting and further analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
