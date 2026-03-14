import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background-light px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <Outlet />
      </div>
    </div>
  );
}
