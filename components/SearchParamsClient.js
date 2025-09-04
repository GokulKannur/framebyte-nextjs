// app/components/SearchParamsClient.js
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchParamsClient({ onChange }) {
  const searchParams = useSearchParams();

  // Example: read a query param called 'q'
  const query = searchParams.get("q") || "";

  // Optional: call a callback if parent wants to react to query changes
  if (onChange) onChange(query);

  return (
    <div>
      {/* Render something based on query */}
      {query ? `Search query: ${query}` : "No search query"}
    </div>
  );
}
