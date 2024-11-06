// frontend/src/app/components/RequestCountDisplay.tsx

"use client"
import { useEffect, useState } from 'react';

interface RequestCountDisplayProps {
  requestCount: number | null;
  setRequestCount: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function RequestCountDisplay({ requestCount, setRequestCount }: RequestCountDisplayProps) {
  const [maxRequestCount, setMaxRequestCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/requestCount/`);
        const data = await response.json();
        setRequestCount((data.requestCount ?? 0) + 1);
        setMaxRequestCount(data.max_request_count); // Assuming the API returns this value
      } catch (error) {
        console.error('Error fetching request data:', error);
      }
    };

    fetchRequestData();
  }, [setRequestCount]);

  return (
    <div className="flex">
      <div className="p-1 rounded-lg shadow-lg max-w-xl mx-auto">
        <div className="request-count">
          {requestCount !== null && maxRequestCount !== null ? (
            <p className="text-gray-700 si text-sm">Demo Requests used: {requestCount}/{maxRequestCount}</p>
          ) : (
            <p className="text-gray-600 text-sm">Loading request count...</p>
          )}
        </div>
      </div>
    </div>
  );
}
