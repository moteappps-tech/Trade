'use client';
import React from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] text-white">
      <div className="text-center p-8 bg-[#1e222d] border border-[#2a2e39] rounded-xl">
        <h2 className="text-xl font-bold mb-4">An error occurred</h2>
        <p className="text-red-400 mb-6 text-sm">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
