'use client';

export default function Careers() {
  const positions = [
    {
      title: "Senior Full Stack Developer",
      location: "Remote",
      type: "Full-time",
      description: "Help us build the future of financial management.",
    },
    {
      title: "Product Designer",
      location: "Remote",
      type: "Full-time",
      description: "Design beautiful and intuitive financial tools.",
    },
    {
      title: "DevOps Engineer",
      location: "Remote",
      type: "Full-time",
      description: "Scale our infrastructure for millions of users.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Careers</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-12">Join our team and help revolutionize personal finance.</p>

        <div className="space-y-6">
          {positions.map((job, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400">{job.location} • {job.type}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{job.description}</p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Why Join Mney?</h2>
          <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span>Work on impactful financial technology</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span>Fully remote work environment</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span>Competitive salary and benefits</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span>Professional development opportunities</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3">✓</span>
              <span>Collaborative and innovative team</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
