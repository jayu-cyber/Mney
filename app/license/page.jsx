'use client';

export default function License() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">License</h1>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">MIT License</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Copyright © 2025 Jay
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Conditions</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</li>
              <li>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</li>
              <li>IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Mney is built with these open-source technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li>Next.js - React Framework</li>
              <li>Prisma - Database ORM</li>
              <li>Tailwind CSS - Styling</li>
              <li>React Hook Form - Form Management</li>
              <li>Sonner - Toast Notifications</li>
              <li>Lucide Icons - Icon Library</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Attribution</h2>
            <p className="text-slate-600 dark:text-slate-300">
              All third-party libraries used in this project retain their original licenses and attributions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
