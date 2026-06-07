import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "../services/authService";


const SOCKET_URL = "https://parth-the-finder-app.onrender.com";

export interface LiveVehicleData {
  speed?: number;
  fuel?: number;
  ignition?: boolean;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export function useVehicleSocket(vehicleId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [liveData, setLiveData] = useState<LiveVehicleData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    let isMounted = true;

    const connectSocket = async () => {
      const token = await getAuthToken();
      if (!token) {
        console.warn("⚠️ No auth token found for socket");
        return;
      }

    
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket"], 
        auth: {
          token,
        },
      });

    
      socketRef.current.on("connect", () => {
        if (!isMounted) return;
        setConnected(true);
        console.log("🔌 Socket connected successfully");
    
        socketRef.current?.emit("join_vehicle", vehicleId);
      });

    
      socketRef.current.on("vehicle_update", (data: LiveVehicleData) => {
        if (!isMounted) return;
        setLiveData(data);
      });

    
      socketRef.current.on("disconnect", () => {
        if (!isMounted) return;
        setConnected(false);
        console.log("🔴 Socket disconnected");
      });

    
      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    };

    connectSocket();

    
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit("leave_vehicle", vehicleId);
        socketRef.current.disconnect();
        console.log("🧹 Socket cleaned up and disconnected");
      }
    };
  }, [vehicleId]);

  return {
    liveData,
    connected,
  };
}