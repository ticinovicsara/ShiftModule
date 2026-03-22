import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export function PageHeader() {
  const auth = useContext(AuthContext);
  const fullName = auth?.user
    ? `${auth.user.firstName} ${auth.user.lastName}`
    : "Korisnik";
  const roleLabel = auth?.role;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 md:px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
          {fullName}
        </h1>
        {roleLabel ? (
          <p className="mt-1 text-sm text-slate-500">{roleLabel}</p>
        ) : null}
      </div>
    </header>
  );
}
