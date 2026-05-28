import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../services/authService";

const SOCKET_URL = "http://169.254.16.170:5000";

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
      //const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.warn("No auth token found for socket");
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
        console.log("🔌 Socket connected");
        socketRef.current?.emit("join_vehicle", vehicleId);
      });

      socketRef.current.on("vehicle_update", (data) => {
        if (!isMounted) return;
        setLiveData(data);
      });

      socketRef.current.on("disconnect", () => {
        if (!isMounted) return;
        setConnected(false);
        console.log("🔴 Socket disconnected");
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket error:", err.message);
      });
    };

    connectSocket();

    return () => {
      isMounted = false;
      socketRef.current?.emit("leave_vehicle", vehicleId);
      socketRef.current?.disconnect();
    };
  }, [vehicleId]);

  return {
    liveData,
    connected,
  };
}
