'use client';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "How to Budget Effectively",
      excerpt: "Learn the fundamentals of creating a budget that works for your lifestyle.",
      date: "Nov 15, 2025",
      category: "Finance Tips",
    },
    {
      id: 2,
      title: "Understanding Your Spending Patterns",
      excerpt: "Analyze your transactions to identify trends and opportunities to save.",
      date: "Nov 12, 2025",
      category: "Analytics",
    },
    {
      id: 3,
      title: "Multi-Currency Transactions Made Easy",
      excerpt: "How to manage finances across different currencies without the hassle.",
      date: "Nov 10, 2025",
      category: "Features",
    },
    {
      id: 4,
      title: "Getting Started with Mney",
      excerpt: "A comprehensive guide to setting up your first account and transactions.",
      date: "Nov 8, 2025",
      category: "Tutorial",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Blog</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-12">Tips, tutorials, and insights about personal finance and Mney.</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{post.title}</h2>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-500">{post.date}</span>
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
