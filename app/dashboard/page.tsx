"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  userId: number;
  username: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              GrandX Admin
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                Welcome, {user?.username}
              </span>
              {user?.role === "Admin" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/apis"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                APIs
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome to Your Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                API Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add, edit, and manage your API configurations
              </p>
              <Link
                href="/apis"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage APIs
              </Link>
            </div>

            <div className="bg-indigo-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                API Testing
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Test your configured APIs with real HTTP requests
              </p>
              <Link
                href="/apis"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Test APIs
              </Link>
            </div>

            <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                Account Info
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Username: {user?.username}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Role: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
