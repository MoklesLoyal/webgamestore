"use client";

import { StackHandler } from "@stackframe/stack";
import { stackApp } from "@/lib/stack-client";

export default function Handler(props: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WebGameStore</h1>
          <p className="text-gray-600">Gestion de Tokens de Transcription</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <StackHandler 
            app={stackApp} 
            {...props}
          />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Sécurisé et confidentiel</p>
        </div>
      </div>
    </div>
  );
}
