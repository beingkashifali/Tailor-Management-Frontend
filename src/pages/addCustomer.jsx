import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddCustomer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryDate: "",
    totalAmount: "",
    amountPaid: "",
    quantity: 1,
    measurements: {
      teera: "",
      arms: "",
      length: "",
      width: "",
      collor: "",
      shalwar: "",
      moza: "",
      customNotes: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/new-customer", formData);
      toast.success("Customer Added Successfully!");
      navigate("/dashboard");

      setFormData({
        name: "",
        email: "",
        phone: "",
        deliveryDate: "",
        totalAmount: "",
        amountPaid: "",
        quantity: 1,
        measurements: {
          teera: "",
          arms: "",
          length: "",
          width: "",
          collor: "",
          shalwar: "",
          moza: "",
          customNotes: "",
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || "An error occurred");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg my-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">
        Add New Customer
      </h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Customer Name"
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email Address (Optional)"
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <h3 className="font-semibold text-gray-700 mt-6 mb-3 border-b pb-1">
        Measurements (Inches)
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(formData.measurements).map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key}
            value={formData.measurements[key]}
            className="border p-3 rounded-lg capitalize focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) =>
              setFormData({
                ...formData,
                measurements: {
                  ...formData.measurements,
                  [key]: e.target.value,
                },
              })
            }
            required
          />
        ))}
      </div>

      <h3 className="font-semibold text-gray-700 mt-6 mb-3 border-b pb-1">
        Order Details & Payments
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 ml-1">Quantity</label>
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={formData.quantity}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 ml-1">Total Amount</label>
          <input
            type="number"
            placeholder="Total (Rs)"
            value={formData.totalAmount}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, totalAmount: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 ml-1">Advance/Paid</label>
          <input
            type="number"
            placeholder="Paid (Rs)"
            value={formData.amountPaid}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) =>
              setFormData({ ...formData, amountPaid: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700 ml-1">
          Delivery Date
        </label>
        <input
          type="date"
          className="w-full border p-3 mt-1 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
          value={formData.deliveryDate}
          onChange={(e) =>
            setFormData({ ...formData, deliveryDate: e.target.value })
          }
          required
        />
      </div>

      <button className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-8 font-bold hover:bg-indigo-700 active:scale-95 transition-transform">
        Save Customer
      </button>
    </form>
  );
};

export default AddCustomer;
