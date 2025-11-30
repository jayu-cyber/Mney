"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function SignInListener() {
  const { isSignedIn, isLoaded } = useUser();
  const prevSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (!isLoaded) return;

    // Show a single toast when transitioning from signed out -> signed in
    if (!prevSignedIn.current && isSignedIn) {
      toast.success("Logged in successfully");
    }

    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded]);

  return null;
}
