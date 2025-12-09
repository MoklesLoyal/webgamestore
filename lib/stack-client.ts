"use client";

import { StackClientApp } from "@stackframe/stack";

export const stackApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  urls: {
    home: "/",
    signIn: "/handler/sign-in",
    afterSignIn: "/dashboard",
    signUp: "/handler/sign-up",
    afterSignUp: "/dashboard",
  },
});
