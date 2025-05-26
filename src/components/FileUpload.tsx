"use client";

import React from "react";
import { useState } from 'react';
import axios from 'axios';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout for big files
      });

      console.log('✅ Upload success:', res.data);
      setUploadedFileUrl(`http://localhost:5000/api/files/download/${res.data.filename}`);
    } catch (error) {
      console.error('❌ Upload failed:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload a File</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="mb-4"
      />
      
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>

      {uploadedFileUrl && (
        <div className="mt-4">
          <p className="text-green-600">✅ File uploaded!</p>
          <a
            href={uploadedFileUrl}
            download
            className="text-blue-700 underline"
          >
            Download your file
          </a>
        </div>
      )}
    </div>
  );
}
