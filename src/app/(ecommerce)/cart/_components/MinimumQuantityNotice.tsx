"use client";

import React from "react";

export function MinimumQuantityNotice() {
  return (
    <div className="mb-6 rounded-none bg-red-50 p-4 relative">
      <div className="flex items-center justify-center space-x-2 text-sm">
        <img src="/pentagon.svg" className="absolute left-4" alt="icon" />
        <div>Minimum quantity is</div>
        <div className="rounded bg-red-500 px-2 py-0.5 text-white">10</div>
      </div>
    </div>
  );
}
