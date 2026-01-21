import { NextRequest, NextResponse } from "next/server";

/**
 * API route to proxy images for OpenGraph/Twitter cards
 * This ensures proper headers are set for social media crawlers
 * 
 * Usage: /api/og-image?url=<encoded-image-url>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Decode the URL
    let decodedUrl = decodeURIComponent(imageUrl);

    // Handle Google Drive URLs - convert to direct image export format
    if (decodedUrl.includes("drive.google.com")) {
      // Extract file ID from various Google Drive URL formats
      const fileIdMatch = decodedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                         decodedUrl.match(/id=([a-zA-Z0-9_-]+)/);
      
      if (fileIdMatch && fileIdMatch[1]) {
        // Use direct Google Drive image export URL
        decodedUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
    }
    // Handle Dropbox URLs - convert to raw format for direct image access
    else if (decodedUrl.includes("dropbox.com")) {
      // Dropbox share links: https://www.dropbox.com/s/<id>/<filename>?dl=0 or ?dl=1
      // Convert to: https://www.dropbox.com/s/<id>/<filename>?raw=1
      const dropboxMatch = decodedUrl.match(/^(https?:\/\/[^\/]+\/s\/[^?]+)/);
      if (dropboxMatch && dropboxMatch[1]) {
        // Remove existing query params and add ?raw=1
        decodedUrl = `${dropboxMatch[1]}?raw=1`;
      } else {
        // If URL doesn't match expected pattern, try adding ?raw=1 if not present
        if (!decodedUrl.includes("?raw=1") && !decodedUrl.includes("?raw=0")) {
          decodedUrl = decodedUrl.split("?")[0] + "?raw=1";
        }
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Fetch the image from the source
    let imageResponse: Response;
    try {
      imageResponse = await fetch(decodedUrl, {
        headers: {
          // Use a standard user agent that works with most image sources
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/*,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return new NextResponse("Request timeout", { status: 408 });
      }
      throw fetchError;
    }

    if (!imageResponse.ok) {
      console.error(
        `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`
      );
      return new NextResponse("Failed to fetch image", {
        status: imageResponse.status,
      });
    }

    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Determine content type from response or URL
    let contentType = imageResponse.headers.get("content-type");

    // If no content type or invalid, try to infer from URL or default to jpeg
    if (!contentType || !contentType.startsWith("image/")) {
      const urlLower = decodedUrl.toLowerCase();
      if (urlLower.includes(".png") || urlLower.includes("png")) {
        contentType = "image/png";
      } else if (urlLower.includes(".gif") || urlLower.includes("gif")) {
        contentType = "image/gif";
      } else if (urlLower.includes(".webp") || urlLower.includes("webp")) {
        contentType = "image/webp";
      } else if (urlLower.includes(".svg") || urlLower.includes("svg")) {
        contentType = "image/svg+xml";
      } else {
        contentType = "image/jpeg"; // Default
      }
    }

    // Return the image with proper headers for OG/Twitter cards
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": imageBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "X-Content-Type-Options": "nosniff",
        // Important for Twitter/Facebook crawlers
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    // Return a 500 error, but don't expose internal details
    return new NextResponse("Internal server error", { status: 500 });
  }
}
