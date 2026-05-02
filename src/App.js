import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AiPage from "./pages/AiPage";
import History from "./pages/History";
import Resume from "./pages/Resume";
import Interview from "./pages/Interview";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview" element={<Interview />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;