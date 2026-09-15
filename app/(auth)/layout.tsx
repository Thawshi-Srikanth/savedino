import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground font-sans select-none">
      {children}
    </div>
  );
}
