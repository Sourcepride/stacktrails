"use client";

import { googleSignIn } from "@/lib/googleSigning";
import { useEffect, useRef } from "react";

export default function useGoogleOneTap() {
  const googleAvailable = useRef(false);

  useEffect(() => {
    // Function to check if Google is loaded and initialize
    const initializeGoogle = async () => {
      try {
        await googleSignIn(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);

        // send to your backend
      } catch (error) {
        console.log("Google sign-in error:", error);
      }
    };

    // Function to wait for Google to be available
    const waitForGoogle = () => {
      if (typeof window !== "undefined" && (window as any)?.google) {
        googleAvailable.current = true;
        initializeGoogle();
      } else {
        // If Google is not available yet, wait a bit and try again
        setTimeout(waitForGoogle, 100);
      }
    };

    // Start waiting for Google to be available
    waitForGoogle();

    // Cleanup function
    return () => {
      googleAvailable.current = false;
    };
  }, []); // Empty dependency array since we're checking inside useEffect
}
