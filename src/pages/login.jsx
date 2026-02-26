import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sends data to your POST /login endpoint
      const response = await API.post("/login", formData);

      // Save the generated JWT token to local storage
      localStorage.setItem("token", response.data.token);

      // Optionally, save user info to know if they are an Owner or Team member
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Login to manage your tailorshop
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            required
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-indigo-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-indigo-700 active:scale-95 transition-transform"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have a shop account yet?{" "}
          <Link to="/signup" className="text-indigo-600 font-bold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
