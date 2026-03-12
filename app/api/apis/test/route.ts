import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import axios, { AxiosError } from "axios";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { apiId, method, customBody } = body;

    if (!apiId || !method) {
      return NextResponse.json(
        { error: "apiId and method are required" },
        { status: 400 }
      );
    }

    // Fetch the API configuration
    const apiConfig = await prisma.aPI.findUnique({
      where: { id: parseInt(apiId) },
    });

    if (!apiConfig) {
      return NextResponse.json(
        { error: "API configuration not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this API
    if (user.role !== "Admin" && apiConfig.userId !== user.userId) {
      return NextResponse.json(
        { error: "Not authorized to test this API" },
        { status: 403 }
      );
    }

    // Prepare headers
    const headers: Record<string, string> = {};
    if (apiConfig.headers) {
      const headerObj = apiConfig.headers as Record<string, string>;
      Object.entries(headerObj).forEach(([key, value]) => {
        headers[key] = value;
      });
    }

    // Prepare request configuration
    const config: any = {
      method,
      url: apiConfig.endpoint,
      headers,
      timeout: 10000, // 10 seconds timeout
    };

    // Add body for POST, PUT, DELETE methods
    if (
      (method === "POST" || method === "PUT" || method === "DELETE") &&
      customBody
    ) {
      config.data = customBody;
    }

    // Make the actual HTTP request
    const startTime = Date.now();
    try {
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        responseTime,
      });
    } catch (axiosError) {
      const error = axiosError as AxiosError;
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        success: false,
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Request failed",
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
        responseTime,
      });
    }
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
