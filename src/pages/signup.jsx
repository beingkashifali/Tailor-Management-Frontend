import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api"; // The API helper we created earlier

const Signup = () => {
  // State to store what the user types in the form
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  // useNavigate is a hook from React Router to change pages
  const navigate = useNavigate();

  // Function that runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError("");

    try {
      // Sends data to your POST /register endpoint
      const response = await API.post("/register", formData);

      // Save the JWT token to the browser's local storage
      localStorage.setItem("token", response.data.token);

      // Redirect the tailor to their new dashboard
      navigate("/dashboard");
    } catch (err) {
      // If the backend sends an error (like "Username already exists"), show it
      setError(
        err.response?.data?.msg || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2 text-center">
          Create Shop Account
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Register your tailoring business
        </p>

        {/* Display error message if there is one */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Full Name"
            required
            className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Choose a Username"
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
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
