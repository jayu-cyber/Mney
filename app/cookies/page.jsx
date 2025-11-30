'use client';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Cookie Policy</h1>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Mney uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Authentication:</strong> To keep you logged in to your account</li>
              <li><strong>Preferences:</strong> To remember your language, theme, and currency choices</li>
              <li><strong>Analytics:</strong> To understand how you use our service</li>
              <li><strong>Security:</strong> To protect against fraudulent activity</li>
              <li><strong>Functionality:</strong> To enable essential features of the application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Cookies</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Essential Cookies</h3>
                <p className="text-slate-600 dark:text-slate-300">Required for the website to function properly. Cannot be disabled.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Preference Cookies</h3>
                <p className="text-slate-600 dark:text-slate-300">Remember your settings and preferences to personalize your experience.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Analytics Cookies</h3>
                <p className="text-slate-600 dark:text-slate-300">Help us understand how visitors interact with our website.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p className="text-slate-600 dark:text-slate-300">
              You can control and/or delete cookies as you wish. Most web browsers allow you to refuse cookies or alert you when cookies are being sent. However, some features of Mney may not function properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300">
              If you have questions about our use of cookies, please contact us at privacy@mney.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
