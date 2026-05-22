'use client';
import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <div className="p-8 bg-neutral-900 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-red-400 mb-4">{error.message}</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
