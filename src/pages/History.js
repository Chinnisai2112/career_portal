import { useEffect, useState } from "react";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/ai/history",
        { headers: { Authorization: token } }
      );

      setHistory(res.data.history);
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your History</h1>

      {history.map((item, index) => (
        <div key={index} className="bg-white p-4 mb-3 rounded shadow">
          <p><b>Q:</b> {item.question}</p>
          <p><b>A:</b> {item.answer}</p>
        </div>
      ))}
    </div>
  );
}