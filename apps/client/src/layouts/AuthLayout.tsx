import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background-light flex items-start sm:items-center justify-center px-4 pt-12 sm:pt-0">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <Outlet />
      </div>
    </div>
  );
}
