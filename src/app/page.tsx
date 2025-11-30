"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "./utils/CheckLoggedin";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--brand-surface)] via-white to-[var(--brand-surface)] bg-cover bg-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-gray-700">Redirecting...</span>
      </div>
    </div>
  );
}
