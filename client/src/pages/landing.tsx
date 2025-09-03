import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Calendar, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ExpenseFlow</h1>
            </div>
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="bg-brand-500 hover:bg-brand-600"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Financial Task Management
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automate your expense tracking and never miss a payment again. 
            ExpenseFlow turns your recurring expenses into manageable tasks.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card data-testid="card-feature-expenses">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Expense Management
              </h3>
              <p className="text-gray-600">
                Create and categorize your recurring expenses with due dates and amounts.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-feature-automation">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automated Tasks
              </h3>
              <p className="text-gray-600">
                Automatically generate monthly financial tasks from your expense list.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-feature-tracking">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Tracking
              </h3>
              <p className="text-gray-600">
                Mark tasks as paid, hold payments, and track your monthly financial progress.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to streamline your finances?
          </h3>
          <p className="text-gray-600 mb-8">
            Sign in with your Google or Apple account to get started.
          </p>
          <Button
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-brand-500 hover:bg-brand-600"
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
