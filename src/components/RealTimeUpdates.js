import React from "react";
import { useSocket } from "@/hooks/useSocket";

export default function RealTimeUpdates() {
  const { events } = useSocket();

  return (
    <div>
      <h2>Real-Time Updates</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </div>
  );
}
