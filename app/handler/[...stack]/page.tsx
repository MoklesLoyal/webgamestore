"use client";

import { StackHandler } from "@stackframe/stack";
import { stackApp } from "@/lib/stack-client";
import { Package } from "lucide-react";

export default function Handler(props: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">TokenShopSimulator</h1>
          </div>
          <p className="text-slate-600">Gestion de Tokens de Transcription</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-slate-200/60">
          <StackHandler 
            app={stackApp} 
            {...props}
          />
        </div>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>🔒 Sécurisé et confidentiel</p>
        </div>
      </div>
    </div>
  );
}
