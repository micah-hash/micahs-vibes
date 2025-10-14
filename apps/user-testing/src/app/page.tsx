import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Fluid Automated Testing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor your critical business flows with automated tests that run on your schedule
          </p>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Never Miss a Critical Failure
              </h2>
              <p className="text-gray-600 mb-6">
                Automatically test your purchase flows, authentication, refunds, and more. 
                Get instant alerts when something breaks, before your customers notice.
              </p>
              <Link
                href="/user-testing"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Product Purchase Flow</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Subscription Flow</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Refund Flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              5 Test Scenarios
            </h3>
            <p className="text-gray-600">
              Product purchase, enrollments, subscriptions, refunds, and authentication
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Flexible Scheduling
            </h3>
            <p className="text-gray-600">
              Run tests every 30 minutes, hourly, daily, or every other day
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Analytics
            </h3>
            <p className="text-gray-600">
              Visual charts and insights showing success rates and trends over time
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Email Notifications
            </h3>
            <p className="text-gray-600">
              Receive beautiful HTML reports with detailed pass/fail information
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Detailed Results
            </h3>
            <p className="text-gray-600">
              Step-by-step breakdown of each test with error details and timing
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Instant Alerts
            </h3>
            <p className="text-gray-600">
              Get notified immediately when tests fail so you can fix issues fast
            </p>
          </div>
        </div>

        {/* Test Types */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Automated Test Scenarios
          </h2>
          <div className="space-y-4">
            {[
              {
                name: 'Product Purchase Flow',
                description: 'Complete journey from product selection to order completion'
              },
              {
                name: 'Enrollment Purchase Flow',
                description: 'Enrollment-based purchases with registration and billing'
              },
              {
                name: 'Subscription Purchase Flow',
                description: 'Recurring subscription setup and billing configuration'
              },
              {
                name: 'Refund/Return Flow',
                description: 'Refund processing and return workflow validation'
              },
              {
                name: 'Customer Authentication',
                description: 'Registration, login, and authentication token validation'
              },
            ].map((test, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
                <p className="text-gray-600 text-sm">{test.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Testing?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Install this droplet in Fluid to start monitoring your critical flows
          </p>
          <Link
            href="/user-testing"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            View Demo Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Built for Fluid • Automated Testing Droplet</p>
        </div>
      </div>
    </div>
  );
}
