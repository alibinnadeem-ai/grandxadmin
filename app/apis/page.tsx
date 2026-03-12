"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ApiUser {
  id: number;
  username: string;
}

interface Api {
  id: number;
  name: string;
  description: string;
  endpoint: string;
  headers: Record<string, string>;
  authMethod: string;
  dummyData: Record<string, any>;
  userId: number;
  user: ApiUser;
  createdAt: string;
}

interface ApiUser {
  userId: number;
  username: string;
  role: string;
}

export default function ApisPage() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApi, setEditingApi] = useState<Api | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [selectedApi, setSelectedApi] = useState<Api | null>(null);
  const [testMethod, setTestMethod] = useState("GET");
  const [testBody, setTestBody] = useState("{}");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    endpoint: "",
    headers: "{}",
    authMethod: "None",
    dummyData: "{}",
  });

  useEffect(() => {
    checkAuth();
    fetchApis();
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

  const fetchApis = async () => {
    try {
      const response = await fetch("/api/apis");
      const data = await response.json();

      if (response.ok) {
        setApis(data.apis || []);
      }
    } catch (error) {
      console.error("Error fetching APIs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const headersObj = JSON.parse(formData.headers);
      const dummyDataObj = JSON.parse(formData.dummyData);

      const body = {
        ...formData,
        headers: headersObj,
        dummyData: dummyDataObj,
      };

      const url = editingApi ? `/api/apis/${editingApi.id}` : "/api/apis";
      const method = editingApi ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingApi(null);
        resetForm();
        fetchApis();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save API");
      }
    } catch (error) {
      alert("Invalid JSON in headers or dummy data");
    }
  };

  const handleEdit = (api: Api) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      description: api.description,
      endpoint: api.endpoint,
      headers: JSON.stringify(api.headers, null, 2),
      authMethod: api.authMethod,
      dummyData: JSON.stringify(api.dummyData, null, 2),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this API?")) return;

    try {
      const response = await fetch(`/api/apis/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApis();
      } else {
        alert("Failed to delete API");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleTest = async () => {
    if (!selectedApi) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const bodyObj = JSON.parse(testBody);

      const response = await fetch("/api/apis/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId: selectedApi.id,
          method: testMethod,
          customBody: bodyObj,
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: "Invalid JSON in test body",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      endpoint: "",
      headers: "{}",
      authMethod: "None",
      dummyData: "{}",
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingApi(null);
    resetForm();
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
              GrandX Admin - API Management
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                {currentUser?.username}
              </span>
              {currentUser?.role === "Admin" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
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
        {!showForm && !showTest ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Your APIs
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New API
              </button>
            </div>

            {apis.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  No APIs configured yet
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Click &quot;Add New API&quot; to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api) => (
                  <div
                    key={api.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {api.name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {api.authMethod}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {api.description || "No description"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 break-all">
                      {api.endpoint}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>Owner: {api.user.username}</span>
                      <span>
                        {new Date(api.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApi(api);
                          setShowTest(true);
                        }}
                        className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Test
                      </button>
                      {currentUser?.role === "Admin" ||
                      api.userId === currentUser?.userId ? (
                        <>
                          <button
                            onClick={() => handleEdit(api)}
                            className="flex-1 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(api.id)}
                            className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : showForm ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingApi ? "Edit API" : "Add New API"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.example.com/endpoint"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headers (JSON)
                </label>
                <textarea
                  value={formData.headers}
                  onChange={(e) =>
                    setFormData({ ...formData, headers: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  rows={3}
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Authentication Method
                </label>
                <select
                  value={formData.authMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, authMethod: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="None">None</option>
                  <option value="API Key">API Key</option>
                  <option value="Bearer Token">Bearer Token</option>
                  <option value="OAuth">OAuth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dummy Response Data (JSON)
                </label>
                <textarea
                  value={formData.dummyData}
                  onChange={(e) =>
                    setFormData({ ...formData, dummyData: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  rows={4}
                  placeholder='{"status": "ok", "data": []}'
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingApi ? "Update API" : "Create API"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Test API: {selectedApi?.name}
              </h2>
              <button
                onClick={() => setShowTest(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Endpoint:</span>{" "}
                  {selectedApi?.endpoint}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-semibold">Auth Method:</span>{" "}
                  {selectedApi?.authMethod}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-semibold">Headers:</span>
                </p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(selectedApi?.headers, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HTTP Method
                  </label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              {(testMethod === "POST" ||
                testMethod === "PUT" ||
                testMethod === "DELETE") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    rows={4}
                  />
                </div>
              )}

              <button
                onClick={handleTest}
                disabled={testLoading}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? "Testing..." : "Send Request"}
              </button>

              {testResult && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Response
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        testResult.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {testResult.status} {testResult.statusText}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Response time: {testResult.responseTime}ms
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(testResult.data || testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
