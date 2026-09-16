import { useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";

export function useWebSocket(
  endpoint: string,
  onMessage?: (data: any) => void,
  userId?: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = userId ? `${WS_URL}/${endpoint}/${userId}` : `${WS_URL}/${endpoint}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log(`WebSocket connected to ${url}`);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      // Add reconnection logic here
    };

    return () => {
      ws.current?.close();
    };
  }, [endpoint, userId]);

  const send = (message: any) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, send };
}
