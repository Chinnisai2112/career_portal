function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">AI Assistant</h2>
          <p className="text-gray-500">Ask career-related questions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Resume Analyzer</h2>
          <p className="text-gray-500">Improve your resume</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Mock Interview</h2>
          <p className="text-gray-500">Practice interview questions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">History</h2>
          <p className="text-gray-500">View past AI responses</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;