"use client";
import React from "react";
import Link from "next/link";
import Transactions from "@/components/Transactions";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <div className="relative min-h-screen bg-gray-100 px-4 py-6">
      {/* Back button fixed to the left */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Centered Transactions content */}
      <div className="max-w-5xl mx-auto mt-12">
        <Transactions />
      </div>
    </div>
  );
}
