'use client';

import { useTranslation } from '@/lib/use-translation';

export default function About() {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">About Mney</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            At Mney, we believe that financial management should be simple, intuitive, and accessible to everyone. Our mission is to empower individuals to take control of their finances through intelligent tracking and insights.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Founded by Jay, Mney started as a personal project to solve a simple problem: keeping track of daily expenses and understanding spending patterns. What began as a personal tool has evolved into a comprehensive financial management platform.
          </p>

          <h2 className="text-2xl font-bold mb-4">Why Mney?</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span className="text-slate-600 dark:text-slate-300"><strong>Smart Tracking:</strong> Automatically categorize and track all your transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span className="text-slate-600 dark:text-slate-300"><strong>Multi-Currency:</strong> Support for USD, INR, JPY and more</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span className="text-slate-600 dark:text-slate-300"><strong>Budget Management:</strong> Set and track budgets with real-time alerts</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span className="text-slate-600 dark:text-slate-300"><strong>Multi-Language:</strong> Available in English, Hindi, and Kannada</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span className="text-slate-600 dark:text-slate-300"><strong>Beautiful Dashboard:</strong> Visualize your finances with interactive charts</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            While small, our team is passionate about creating the best financial management experience. We're constantly listening to user feedback and improving Mney based on real-world needs.
          </p>
        </div>
      </div>
    </div>
  );
}
