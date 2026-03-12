"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  role: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  _count: {
    apis: number;
  };
}

interface ApiUser {
  userId: number;
  username: string;
  role: string;
}

type FilterType = "all" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, [filter]);

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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/all");
      const data = await response.json();

      if (response.ok) {
        let filteredUsers = data.users || [];

        if (filter !== "all") {
          filteredUsers = filteredUsers.filter((user: User) =>
            user.status === filter.toUpperCase()
          );
        }

        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
        fetchUsers();
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their APIs.")) {
      return;
    }

    setDeleteLoading(userId);

    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.status === "PENDING") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Pending
        </span>
      );
    } else if (user.status === "APPROVED") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Approved
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Rejected
        </span>
      );
    }
  };

  const getPendingUsersCount = () => users.filter(u => u.status === "PENDING").length;
  const getApprovedUsersCount = () => users.filter(u => u.status === "APPROVED").length;
  const getRejectedUsersCount = () => users.filter(u => u.status === "REJECTED").length;
  const getTotalUsersCount = () => users.length;

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              User Management
            </h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterType
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {filter === "all" ? "No users found" : `No ${filter} users found`}
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      APIs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className={user.status === "REJECTED" ? "bg-red-50 dark:bg-red-900/20" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user._count.apis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {currentUser?.userId === user.id ? (
                            <span className="text-gray-400 italic text-xs py-1 px-2">Current account</span>
                          ) : (
                            <>
                              {user.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleApproval(user.id, true)}
                                    disabled={actionLoading === user.id}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {actionLoading === user.id ? "..." : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleApproval(user.id, false)}
                                    disabled={actionLoading === user.id}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {actionLoading === user.id ? "..." : "Reject"}
                                  </button>
                                </>
                              )}
                              {user.status === "APPROVED" && (
                                <button
                                  onClick={() => handleApproval(user.id, false)}
                                  disabled={actionLoading === user.id}
                                  className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Revoke access"
                                >
                                  {actionLoading === user.id ? "..." : "Revoke"}
                                </button>
                              )}
                              {user.status === "REJECTED" && (
                                <button
                                  onClick={() => handleApproval(user.id, true)}
                                  disabled={actionLoading === user.id}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Re-approve"
                                >
                                  {actionLoading === user.id ? "..." : "Approve"}
                                </button>
                              )}
                              {user.role !== "Admin" && (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  disabled={deleteLoading === user.id}
                                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete user"
                                >
                                  {deleteLoading === user.id ? "..." : "Delete"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {getTotalUsersCount()}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Pending Users
            </h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {getPendingUsersCount()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Approved Users
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {getApprovedUsersCount()}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Rejected Users
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {getRejectedUsersCount()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
