"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

import { Transaction } from "./Transactions";

const PIE_COLORS = ["#34d399", "#f87171"]; // green-400, red-400

export default function DashboardGraphs() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");

  useEffect(() => {
    axios.get("/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to fetch users", err));
  }, []);

  useEffect(() => {
    const fetchData = () => {
      axios.get("/api/transactions?limit=1000")
        .then((res) => setTransactions(res.data.data))
        .catch((err) => console.error("Failed to load transactions", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // live updates every 3s
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    return selectedUserId === "" ? transactions : transactions.filter(t => t.user_id === selectedUserId);
  }, [transactions, selectedUserId]);

  const incomeTotal = useMemo(() => {
    return filteredTransactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const expenseTotal = useMemo(() => {
    return filteredTransactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const pieData = useMemo(() => [
    { name: "Income", value: incomeTotal },
    { name: "Expense", value: expenseTotal },
  ], [incomeTotal, expenseTotal]);

  const barData = useMemo(() => {
    const categoryExpenses = filteredTransactions
      .filter(t => t.type === "Expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryExpenses).map(([category, amount]) => ({ category, amount }));
  }, [filteredTransactions]);

  const lineData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0;
    return sorted.map(t => {
      balance += t.type === "Income" ? t.amount : -t.amount;
      return { date: t.date, balance };
    });
  }, [filteredTransactions]);

  return (
    <div className="grid gap-6">
      {/* 🧑 User Filter */}
      <div className="mb-4 max-w-xs">
        <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Select User
        </label>
        <select
          id="userFilter"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value === "" ? "" : Number(e.target.value))}
          className="p-2 border rounded w-full"
        >
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Top Charts: Pie & Bar side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={300} minWidth={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300} minWidth={320}>
            <BarChart data={barData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#818cf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart Card: Full width */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Balance Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
