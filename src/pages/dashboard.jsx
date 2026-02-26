import React, { useEffect, useState } from "react";
import API from "../utils/api";
import {
  Search,
  ArrowLeft,
  Phone,
  Mail,
  Ruler,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = async () => {
    try {
      const { data } = await API.get("/customer-data");
      setCustomers(data.customers);
      calculateAlerts(data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateAlerts = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = list.filter((c) => {
      if (c.status !== "pending") return false;

      const deliveryDate = new Date(c.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);

      const diffTime = deliveryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 2;
    });

    setAlerts(upcoming);
  };

  const handleStatusUpdate = async (customer) => {
    try {
      // 1. Update the status
      await API.patch(`/update-customer-status/${customer._id}`, {
        status: "sewed",
      });

      // 2. Refresh data
      fetchData();
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // --- UPDATED: Automatically sync lifetime clothes when edits are saved ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Save the edited customer details
      await API.put(`/update-customer/${editingCustomer._id}`, editingCustomer);

      setEditingCustomer(null);

      // Update selected customer if it's currently open
      if (selectedCustomer && selectedCustomer._id === editingCustomer._id) {
        setSelectedCustomer(editingCustomer);
      }

      // 3. Refresh data
      fetchData();
      toast.success("Customer updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update customer");
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const getAlertTag = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(dateString);
    dDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return { text: "OVERDUE", color: "bg-red-800" };
    if (diffDays === 0) return { text: "TODAY", color: "bg-red-600" };
    if (diffDays === 1) return { text: "TOMORROW", color: "bg-orange-500" };
    return { text: "IN 2 DAYS", color: "bg-yellow-500 text-black" };
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- DASHBOARD STATS ---
  const unstitchedCount = customers
    .filter((c) => c.status === "pending")
    .reduce((total, customer) => total + customer.quantity, 0);

  // --- SEARCH, FILTER, AND SORT LOGIC ---
  const processedCustomers = customers
    .filter((c) => {
      // 1. Search Filter (by name or phone)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(searchQuery);

      // 2. Tab Category Filter
      const matchesTab = activeTab === "all" ? true : c.status === activeTab;

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      // 3. Always sort: Pending (1) -> Sewed (2) -> Delivered (3)
      const statusOrder = { pending: 1, sewed: 2, delivered: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  // --- FULL PAGE DETAIL VIEW COMPONENT ---
  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedCustomer.name}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-600 font-medium">
                <span className="flex items-center gap-1">
                  <Phone size={16} /> {selectedCustomer.phone}
                </span>
                {selectedCustomer.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={16} /> {selectedCustomer.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-5 py-2 rounded-full font-bold capitalize text-lg shadow-sm border ${
                  selectedCustomer.status === "delivered"
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : selectedCustomer.status === "sewed"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                {selectedCustomer.status}
              </span>
              <button
                onClick={() => setEditingCustomer(selectedCustomer)}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-200 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Measurements Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900 border-b pb-3">
                <Ruler className="text-indigo-600" /> Measurements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Object.entries(selectedCustomer.measurements)
                  .filter(([key]) => key !== "customNotes")
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                    >
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                        {key}
                      </p>
                      <p className="text-lg font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">
                  Custom Notes
                </p>
                <p className="text-gray-800 font-medium whitespace-pre-wrap">
                  {selectedCustomer.measurements.customNotes ||
                    "No extra notes provided."}
                </p>
              </div>
            </div>

            {/* Order & Payment Summary Section */}
            <div className="space-y-6">
              {/* Order Details */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900 border-b pb-3">
                  <ClipboardList className="text-indigo-600" /> Order Details
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium tracking-wide">
                      Current Order Quantity
                    </span>
                    <span className="font-bold text-xl text-gray-900">
                      {selectedCustomer.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium tracking-wide">
                      Delivery Date
                    </span>
                    <span
                      className={`font-bold text-lg ${selectedCustomer.status === "pending" ? "text-red-600" : "text-gray-900"}`}
                    >
                      {new Date(
                        selectedCustomer.deliveryDate,
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900 border-b pb-3">
                  <CreditCard className="text-indigo-600" /> Payment Status
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600 font-medium">
                      Total Bill
                    </span>
                    <span className="font-bold text-gray-900">
                      Rs. {selectedCustomer.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg text-green-700">
                    <span className="font-medium">Amount Paid</span>
                    <span className="font-bold">
                      Rs. {selectedCustomer.amountPaid}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xl bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                    <span className="font-bold text-red-800">
                      Remaining Balance
                    </span>
                    <span className="font-black text-red-700">
                      Rs.{" "}
                      {selectedCustomer.totalAmount -
                        selectedCustomer.amountPaid}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* If user clicks edit from the detail page, show the modal */}
        {editingCustomer && renderEditModal()}
      </div>
    );
  }

  // --- REGULAR DASHBOARD VIEW COMPONENT ---

  // Helper function to render the modal so we don't repeat code
  function renderEditModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-indigo-900">
              Edit Customer Profile
            </h2>
            <button
              onClick={() => setEditingCustomer(null)}
              className="text-gray-500 hover:text-red-500 font-bold text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-semibold">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        name: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email || ""}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        email: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Measurements Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
                Measurements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(editingCustomer.measurements)
                  .filter((key) => key !== "customNotes")
                  .map((key) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 font-semibold capitalize">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={editingCustomer.measurements[key]}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            measurements: {
                              ...editingCustomer.measurements,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                  ))}
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 font-semibold">
                  Custom Notes
                </label>
                <textarea
                  value={editingCustomer.measurements.customNotes}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      measurements: {
                        ...editingCustomer.measurements,
                        customNotes: e.target.value,
                      },
                    })
                  }
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none min-h-15"
                />
              </div>
            </div>

            {/* Order Details Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
                Order Details & Payments
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-indigo-700 font-bold">
                    Order Status
                  </label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        status: e.target.value,
                      })
                    }
                    className="w-full border-2 border-indigo-200 bg-indigo-50 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="sewed">Sewed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-gray-500 font-semibold">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(editingCustomer.deliveryDate)}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        deliveryDate: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.quantity}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-semibold">
                    Total Amount (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.totalAmount}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        totalAmount: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-green-700 font-bold">
                    Amount Paid (Rs)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.amountPaid}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        amountPaid: e.target.value,
                      })
                    }
                    className="w-full border-2 border-green-300 bg-green-50 p-2 rounded focus:ring-2 focus:ring-green-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="w-full sm:w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-2/3 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 active:scale-95 transition-transform"
              >
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen relative">
      {/* Top Stats Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-indigo-900">Dashboard</h1>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow font-semibold w-full md:w-auto text-center">
          Total Unstitched Clothes: {unstitchedCount}
        </div>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Search Input */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          {["all", "pending", "sewed", "delivered"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- THE ALERT BANNER FEATURE --- */}
      {alerts.length > 0 && searchQuery === "" && activeTab === "all" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h2 className="font-bold text-red-700 text-lg">
              Urgent Deliveries
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {alerts.map((a) => {
              const tag = getAlertTag(a.deliveryDate);
              return (
                <div
                  key={a._id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-3 rounded shadow-sm border border-red-100 gap-2"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      {a.name}{" "}
                      <span className="text-gray-500 text-sm font-normal">
                        ({a.phone})
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Due Date: {new Date(a.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${tag.color} ${
                      tag.color.includes("text-black") ? "" : "text-white"
                    }`}
                  >
                    {tag.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Cards Grid */}
      {processedCustomers.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-semibold bg-white rounded-xl border">
          No customers found matching your search or filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {processedCustomers.map((customer) => (
            <div
              key={customer._id}
              onClick={() => setSelectedCustomer(customer)}
              className={`p-4 rounded-xl shadow border flex flex-col justify-between transition-all hover:shadow-md cursor-pointer hover:border-indigo-300 ${
                customer.status === "delivered"
                  ? "bg-blue-50 border-blue-200"
                  : customer.status === "sewed"
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                    {customer.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold capitalize ${
                      customer.status === "delivered"
                        ? "bg-blue-200 text-blue-800"
                        : customer.status === "sewed"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">{customer.phone}</p>

                <p className="text-xs font-semibold text-gray-700 mt-3">
                  Due:{" "}
                  <span
                    className={
                      customer.status === "pending" ? "text-red-600" : ""
                    }
                  >
                    {new Date(customer.deliveryDate).toLocaleDateString()}
                  </span>
                </p>

                <div className="mt-2 flex justify-between text-sm bg-white bg-opacity-60 p-2 rounded border border-gray-200">
                  <span className="font-medium text-gray-700">
                    Order Qty:{" "}
                    <span className="font-bold">{customer.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-700">
                    Paid:{" "}
                    <span className="font-bold text-green-700">
                      Rs.{customer.amountPaid}
                    </span>{" "}
                    /{" "}
                    <span className="text-gray-500">
                      Rs.{customer.totalAmount}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {/* Prevent Full Page Open When Clicking Action Buttons */}
                {customer.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(customer);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 text-sm transition-colors active:scale-95"
                  >
                    Mark as Sewed
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCustomer(customer);
                  }}
                  className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg font-semibold hover:bg-indigo-200 border border-indigo-200 text-sm transition-colors active:scale-95"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- EDIT CUSTOMER MODAL --- */}
      {editingCustomer && renderEditModal()}
    </div>
  );
};

export default Dashboard;
