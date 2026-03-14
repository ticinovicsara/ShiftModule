import { LABELS } from "../../constants";

export function UnauthorizedPage() {
  return (
    <div className="px-4 py-10 text-center">
      <h1 className="text-2xl font-bold text-slate-900">403</h1>
      <p className="mt-2 text-sm text-slate-600">
        {LABELS.common.unauthorized}
      </p>
    </div>
  );
}
