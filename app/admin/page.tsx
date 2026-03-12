"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

interface ApiUser {
  userId: number;
  username: string;
  role: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPendingUsers();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/users/pending");
      const data = await response.json();

      if (response.ok) {
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const handleApproval = async (userId: number, isApproved: boolean) => {
    setActionLoading(userId);

    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });

      if (response.ok) {
        // Refresh the list
        fetchPendingUsers();
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setActionLoading(null);
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
              GrandX Admin - Admin Panel
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                Admin: {currentUser?.username}
              </span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/apis"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                APIs
              </Link>
              <button
                onClick={() => {
                  fetch("/api/auth/me", { method: "POST" });
                  window.location.href = "/";
                }}
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
            Pending User Approvals
          </h2>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                No pending users awaiting approval
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requested On
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApproval(user.id, true)}
                          disabled={actionLoading === user.id}
                          className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.id ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleApproval(user.id, false)}
                          disabled={actionLoading === user.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.id ? "Rejecting..." : "Reject"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Total Pending Users
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {pendingUsers.length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Admin Credentials
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Username: alibinnadeem
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
              Quick Links
            </h3>
            <Link
              href="/apis"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage All APIs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
