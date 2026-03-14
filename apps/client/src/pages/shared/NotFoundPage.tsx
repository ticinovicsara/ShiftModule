import { LABELS } from "../../constants";

export function NotFoundPage() {
  return (
    <div className="px-4 py-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-600">{LABELS.common.notFound}</p>
    </div>
  );
}
