"use client";

import { useSocket } from "@/context/SocketContext";

export function ConnectionInfo() {
  const { isConnected, transport, connect, disconnect } = useSocket();

  const handleConnect = () => {
    console.log("connection click detected");

    connect();
  };

  const handleLogin = () => {
    fetch("/api/user/set", {
      method: "POST",
      body: JSON.stringify({ user: "01999fb2-4d7f-7028-979d-2674ae44a659" }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(() => alert("Request done"));
  };

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <div className="text-center">
        <button type="button" onClick={handleLogin}>
          Set cookie
        </button>
      </div>
      <div className="text-center">
        {isConnected && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
        {!isConnected && (
          <button type="button" onClick={handleConnect}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
