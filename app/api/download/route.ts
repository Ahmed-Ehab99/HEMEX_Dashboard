import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get the file path from the query parameters
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return new NextResponse("File path is required", { status: 400 });
  }

  try {
    // Construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Clean the path and base URL
    const cleanPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;
    const cleanBaseUrl = baseUrl?.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;

    // Form the complete URL
    const fullUrl = `${cleanBaseUrl}/${cleanPath}`;

    console.log(`Proxying download request to: ${fullUrl}`);

    // Include authentication
    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const headers: HeadersInit = {};
    if (authToken) {
      headers["userKey"] = authToken;
    }

    // Fetch the file from the API
    const response = await fetch(fullUrl, { headers });

    if (!response.ok) {
      console.error(
        `API responded with: ${response.status} ${response.statusText}`
      );
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      });
    }

    // Get the content type
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Get filename from path
    const filename = filePath.split("/").pop() || "download";

    // Get the file data
    const fileBuffer = await response.arrayBuffer();

    // Set headers for file download
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error proxying file download:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
