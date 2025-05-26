"use client";
import React from "react";
import { Transaction } from "./Transactions";

interface Props {
  transactions: Transaction[];
  searchCategory: string;
  highestExpenseTxn?: Transaction;
  lowestExpenseTxn?: Transaction;
  closestToAverageTxn?: Transaction;
  handleEdit: (txn: Transaction) => void;
  handleDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}

export default function TransactionList({
  transactions,
  searchCategory,
  highestExpenseTxn,
  lowestExpenseTxn,
  closestToAverageTxn,
  handleEdit,
  handleDelete,
  currentPage,
  setCurrentPage,
  totalCount,
  itemsPerPage,
}: Props) {
  // Calculate the correct transactions for the current page
  const currentPageTransactions = transactions;
  
  return (
    <div className="w-full h-full">
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>

        <input
          type="text"
          placeholder="Search by Category"
          value={searchCategory}
          onChange={(e) => {
            const event = new CustomEvent("searchCategoryChange", { detail: e.target.value });
            window.dispatchEvent(event);
            setCurrentPage(1); // Reset to page 1 when searching
          }}
          className="w-full p-3 border-2 border-blue-500 rounded-lg mb-4 bg-blue-100 text-blue-900 placeholder-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 🆕 Check if the current page transactions are empty */}
        {currentPageTransactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          <ul className="space-y-2">
            {currentPageTransactions.map((txn) => (
              <li
                key={txn.id}
                className="p-2 border rounded bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <strong
                    className={txn.type === "Income" ? "text-green-600" : "text-red-600"}
                  >
                    {txn.type}
                  </strong>{" "}
                  -{" "}
                  <span
                    className={`font-semibold ${
                      txn.id === highestExpenseTxn?.id ? "text-red-700" : ""
                    } ${txn.id === lowestExpenseTxn?.id ? "text-blue-600" : ""} ${
                      txn.id === closestToAverageTxn?.id ? "text-yellow-500" : ""
                    }`}
                  >
                    ${txn.amount}
                  </span>{" "}
                  - {txn.category} - {txn.date}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(txn)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination controls */}
        {totalCount > itemsPerPage && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {Math.max(1, Math.ceil(totalCount / itemsPerPage))}
            </span>
            <button
              disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
