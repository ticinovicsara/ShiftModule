import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { LABELS } from "../../constants";

export function ConfirmSwapPage() {
  const params = useParams<{ requestId: string }>();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{LABELS.pages.confirmSwap}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-600">
          {params.requestId}
        </CardContent>
      </Card>
    </div>
  );
}
