import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful ✅");
    } catch (error) {
      console.log("ERROR:", error);
      console.log("RESPONSE:", error.response);
      alert(error.response?.data?.message || "Login failed ❌");
    }
  };

  return (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-gray-700">Login</h2>

    <input
      className="border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      type="password"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      className="bg-blue-500 text-white w-full py-3 rounded-lg hover:bg-blue-600 transition"
      onClick={handleLogin}
    >
      Login
    </button>
  </div>
);
}

export default Login;
