import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui";

export interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-xs text-slate-500">
          {description}
        </CardContent>
      ) : null}
    </Card>
  );
}
