import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { Trash2, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";

const ManageTeam = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  // List State
  const [teamMembers, setTeamMembers] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Team Members on Load
  const fetchTeam = async () => {
    try {
      const { data } = await API.get("/team");
      setTeamMembers(data.members);
    } catch (err) {
      console.error("Failed to load team", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeam();
  }, []);

  // 2. Handle Adding New Member
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/new-member", formData);
      setMessage({ type: "success", text: response.data.msg });
      setFormData({ name: "", username: "", password: "" }); // Clear form
      fetchTeam(); // Refresh list immediately
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.msg || "Failed to add member",
      });
    }
  };

  // 3. Handle Deleting Member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?"))
      return;

    try {
      await API.delete(`/team/${id}`);
      fetchTeam(); // Refresh list
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to delete member");
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mt-6">
        {/* LEFT COLUMN: Add New Member Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Add New Member</h2>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded mb-4 text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              required
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              required
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              required
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-transform">
              Create Account
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Team List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b pb-2">
            <Users className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Your Team ({teamMembers.length})
            </h2>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No team members yet.
            </p>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-xs text-gray-500">@{member.username}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTeam;
