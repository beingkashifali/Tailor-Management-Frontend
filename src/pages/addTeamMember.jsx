import React, { useState } from "react";
import API from "../utils/api";

const AddTeamMember = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/new-member", formData);

      setMessage({ type: "success", text: response.data.msg });
      setFormData({ name: "", username: "", password: "" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.msg || "Failed to add member",
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Add Team Member
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Create an account for your tailor or helper. They will only see data
          for your shop.
        </p>

        {message.text && (
          <div
            className={`p-3 rounded mb-4 text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member's Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign a Username
            </label>
            <input
              type="text"
              value={formData.username}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign a Password
            </label>
            <input
              type="password"
              value={formData.password}
              required
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-indigo-700 active:scale-95 transition-transform"
          >
            Create Member Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
