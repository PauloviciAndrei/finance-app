"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import React from "react";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import { addToQueue, getQueue, clearQueue } from "../utils/offlineQueue";
import { io } from "socket.io-client";


export interface Transaction {
  id: number;
  type: string;
  amount: number;
  category: string;
  date: string;
  user_id?: number;
}

type ValidationErrors = {
  type?: string;
  amount?: string;
  category?: string;
  date?: string;
  user_id?: string;
};

type FormData = {
  id: number | null;
  type: string;
  amount: number | string;
  category: string;
  date: string;
  user_id: number | "";
};

export default function Transactions() {
  const [staticTransactions, setStaticTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<FormData>({
    id: null,
    type: "",
    amount: "",
    category: "",
    date: "",
    user_id: "",
  });
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [stats, setStats] = useState({
    highest: undefined,
    lowest: undefined,
    average: undefined,
    closestToAverage: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isServerUp, setIsServerUp] = useState(true);
  const limit = 5;

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`, {
        params: {
          category: searchCategory,
          page: currentPage,
          limit: limit,
          user_id: selectedUserId || undefined, // only pass if selected
        },
      });      
      const sortedTransactions = [...res.data.data].sort((a, b) => b.id - a.id);
      setStaticTransactions(sortedTransactions);
      setTotalCount(res.data.total);
    } catch (err) {
      console.error("Error loading:", err);
      setIsServerUp(false);
    }
  }, [searchCategory, currentPage,selectedUserId]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error loading stats:", err);
      setIsServerUp(false);
    }
  }, []);

 const syncOfflineQueue = useCallback(async () => {
  const queue = getQueue();
  if (queue.length === 0) return;

  try {
    for (const action of queue) {
      console.log("🔄 Syncing action:", action);

      if (action.type === "ADD") {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`, action.payload);
      } else if (action.type === "UPDATE") {
        const id = action.payload.id;
        if (typeof id === "number" && id < 100000) {
          console.log(`🔧 PUT /api/transactions/${id}`, action.payload);
          await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${id}`, action.payload);
        } else {
          console.warn("⚠️ Skipping invalid update for fake ID:", id);
        }
      } else if (action.type === "DELETE") {
        const id = action.payload.id;
        if (typeof id === "number" && id < 100000) {
          console.log(`🗑 DELETE /api/transactions/${id}`);
          await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${id}`);
        } else {
          console.warn("⚠️ Skipping invalid delete for fake ID:", id);
        }
      }
    }

    clearQueue();
    fetchTransactions();
    fetchStats();
    setSuccessMessage("Offline transactions synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing offline queue:", error);
  }
}, [fetchTransactions, fetchStats]);


  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const updateSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSearchCategory(customEvent.detail);
      setCurrentPage(1);
    };
    window.addEventListener("searchCategoryChange", updateSearch);
    return () => window.removeEventListener("searchCategoryChange", updateSearch);
  }, []);

  useEffect(() => {
    const checkNetwork = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", checkNetwork);
    window.addEventListener("offline", checkNetwork);
    checkNetwork();
    return () => {
      window.removeEventListener("online", checkNetwork);
      window.removeEventListener("offline", checkNetwork);
    };
  }, []);

  useEffect(() => {
    const pingServer = async () => {
      try {
        await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ping`);
        setIsServerUp(true);
      } catch {
        setIsServerUp(false);
      }
    };
    const interval = setInterval(pingServer, 5000);
    pingServer();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isServerUp) syncOfflineQueue();
  }, [isServerUp, syncOfflineQueue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    let parsedValue: string | number = value;
  
    if (name === "amount") {
      parsedValue = Number(value);
    } else if (name === "user_id") {
      parsedValue = value === "" ? "" : Number(value);
    }
  
    setFormData({ ...formData, [name]: parsedValue });
  };  

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`, { transports: ["websocket"] });
    socket.on("connect", () => console.log("✅ WebSocket connected with ID:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ WebSocket connection error:", err.message));
    socket.onAny((event, ...args) => console.log(`📡 Event from server: ${event}`, args));
    socket.on("newTransaction", async () => {
      try {
        await fetchTransactions();
        await fetchStats();
      } catch (error) {
        console.error("Error refreshing transactions after newTransaction:", error);
      }
    });
    socket.on("disconnect", () => console.log("❌ WebSocket disconnected"));
    return () => { socket.disconnect(); };
  }, [fetchTransactions, fetchStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newErrors: ValidationErrors = {};
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.user_id) newErrors.user_id = "User is required";
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
  
    const payload = {
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      user_id: formData.user_id !== "" ? Number(formData.user_id) : undefined,
    };

    console.log("FormData before submit:", formData);
  
    try {
      if (!isOnline || !isServerUp) {
        if (isEditing && formData.id !== null) {
          addToQueue({ type: "UPDATE", payload: { ...payload, id: formData.id } });
        } else {
          addToQueue({ type: "ADD", payload });
        }
        setSuccessMessage("Transaction saved offline and will sync later.");
      } else {
        if (isEditing && formData.id !== null) {
          await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${formData.id}`, payload);
          setSuccessMessage("Transaction updated!");
        } else {
          await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`, payload);
          setSuccessMessage("Transaction added!");
        }
        setCurrentPage(1);
        fetchTransactions();
        fetchStats();
      }
  
      setFormData({ id: null, type: "", amount: "", category: "", date: "", user_id: "" });
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding/updating transaction:", error);
    }
  };
  
  const handleEdit = (txn: Transaction) => {
    setFormData({
      id: txn.id,
      type: txn.type,
      amount: String(txn.amount),
      category: txn.category,
      date: txn.date,
      user_id: txn.user_id ?? "", // ✅ FIX: include fallback to match FormData
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id: number) => {
    try {
      if (!isOnline || !isServerUp) {
        addToQueue({ type: "DELETE", payload: { id } });
        setSuccessMessage("Delete action saved offline and will sync later.");
        return;
      }
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/${id}`);
      setCurrentPage(1);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
  <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    {/* Offline/server messages */}
    {!isOnline && (
      <p className="text-center text-white bg-red-600 p-2 rounded mb-4">
        🔌 You are offline. Changes will sync later.
      </p>
    )}
    {isOnline && !isServerUp && (
      <p className="text-center text-white bg-yellow-500 p-2 rounded mb-4">
        ⚠️ Server unreachable. Offline mode.
      </p>
    )}
    {successMessage && (
      <p className="text-center text-green-600 p-2 rounded mb-4">{successMessage}</p>
    )}

    <h1 className="text-2xl font-bold mb-6 text-center">Transaction Manager</h1>

    <div className="flex flex-col md:flex-row gap-8 items-start">
  {/* Left: Transaction Form */}
  <div className="md:w-1/2 w-full">
    <TransactionForm
      formData={formData}
      isEditing={isEditing}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      errors={errors}
      users={users}
    />
  </div>

  {/* Right: Filter + List in full height */}
  {/* Right: Filter + List */}
<div className="md:w-1/2 w-full flex flex-col">
  {/* Filter dropdown */}
  <div className="mb-4">
    <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
      Filter by User
    </label>
    <select
      id="userFilter"
      value={selectedUserId}
      onChange={(e) => {
        setSelectedUserId(e.target.value === "" ? "" : Number(e.target.value));
        setCurrentPage(1);
      }}
      className="p-2 border rounded w-full"
    >
      <option value="">All Users</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  </div>

  {/* Transaction list - grow to fill space */}
  <div className="flex-1 overflow-auto">
    <TransactionList
      transactions={staticTransactions}
      searchCategory={searchCategory}
      highestExpenseTxn={stats.highest}
      lowestExpenseTxn={stats.lowest}
      closestToAverageTxn={stats.closestToAverage}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalCount={totalCount}
      itemsPerPage={limit}
    />
  </div>
</div>

</div>
  </div>
);

}
