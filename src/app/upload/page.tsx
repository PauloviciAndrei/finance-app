"use client";

import React from "react";
import FileUpload from "@/components/FileUpload";

export const dynamic = 'force-dynamic'; // Make sure it's dynamic (because use client)

export default function UploadPage() {
  return (
    <div className="p-8">
      <FileUpload />
    </div>
  );
}
