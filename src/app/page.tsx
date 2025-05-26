"use client";
import React from "react";
import Link from "next/link";
import DashboardGraphs from "@/components/DashboardGraphs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">📊 Finance Dashboard</h1>

        <DashboardGraphs />

        <div className="text-center mt-12">
          <Link
            href="/transactions"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Go to Transactions
          </Link>
        </div>
      </div>
    </main>
  );
}
