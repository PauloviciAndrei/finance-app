"use client";
import React from "react";

interface User {
  id: number;
  name: string;
}

interface FormData {
  id: number | null;
  type: string;
  amount: number | string;
  category: string;
  date: string;
  user_id: number | "";
}

interface Props {
  formData: FormData;
  isEditing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof FormData, string>>;
  users: User[];
}

export default function TransactionForm({
  formData,
  isEditing,
  handleChange,
  handleSubmit,
  errors,
  users,
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <label htmlFor="type" className="block text-sm font-medium text-gray-700">Transaction Type</label>
      <select
        id="type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select type</option>
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </select>
      {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}

      {/* Amount */}
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}

      {/* Category */}
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

      {/* Date */}
      <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
      <input
        id="date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Select a date"
      />
      {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}

      {/* User */}
      <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">User</label>
      <select
        id="user_id"
        name="user_id"
        value={formData.user_id}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}

      {/* Submit button */}
      <button
        type="submit"
        className={`w-full p-2 rounded text-white ${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}
      >
        {isEditing ? "Update Transaction" : "Add Transaction"}
      </button>
    </form>
  );
}
