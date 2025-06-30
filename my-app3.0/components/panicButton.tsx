"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PanicButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Countdown timer for the confirm screen
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      iv = setInterval(() => setCountdown((c) => c - 1), 1_000);
    } else if (countdown === 0 && isConfirming) {
      setIsConfirming(false);
    }
    return () => clearInterval(iv);
  }, [countdown, isConfirming]);

  // 2) User tapped the big PANIC button
  const handlePanicPress = () => {
    if (!isConfirming && !isActivated) {
      setError(null);
      setIsConfirming(true);
      setCountdown(10);
    }
  };

  // 3) User confirms—fire the network request
  const handleConfirm = async () => {
    setIsConfirming(false);
    setLoading(true);
    setError(null);

    if (!API_URL) {
      setError("Configuration error: missing API URL");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/trigger-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "Trevah",
          location: "Soshanguve South",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      setIsActivated(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setCountdown(0);
    }
  };

  // 4) Cancel the confirmation countdown
  const handleCancel = () => {
    setIsConfirming(false);
    setCountdown(0);
  };

  // 5) Reset everything after success or error
  const handleReset = () => {
    setIsActivated(false);
    setError(null);
  };

  // — Activated state —
  if (isActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              🚨 Alert Activated
            </h2>
            <p className="mb-6 text-red-600">
              Emergency services have been notified. Help is on the way.
            </p>
            <Button onClick={handleReset} disabled={loading} variant="outline">
              Reset System
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // — Confirming state —
  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <Card className="max-w-md w-full border-orange-200">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-2">
              🔥 Confirm Emergency
            </h2>
            <p className="mb-4 text-orange-600">
              Are you sure you want to send an alert?
            </p>
            <div className="text-5xl font-bold text-orange-800 mb-6">
              {countdown}
            </div>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              size="lg"
              className="w-full bg-red-600 text-white mb-2"
            >
              <Phone className="w-4 h-4 mr-2" />
              {loading ? "Sending…" : "Confirm"}
            </Button>
            <Button onClick={handleCancel} variant="outline" size="lg" disabled={loading}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // — Idle state —
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full border-gray-200">
        <CardContent className="text-center p-8">
          {error && <p className="mb-4 text-red-600">Error: {error}</p>}
          <h1 className="text-2xl font-bold mb-2">Emergency Alert System</h1>
          <p className="mb-6 text-gray-600">
            Press only in a real emergency.
          </p>
          <Button
            onClick={handlePanicPress}
            disabled={loading}
            className="w-32 h-32 rounded-full bg-red-600 text-white text-xl"
          >
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 mb-2" />
              PANIC
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}