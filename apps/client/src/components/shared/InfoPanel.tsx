import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui";

export interface InfoPanelProps {
  title: string;
  description?: string;
  content: string;
  tone?: "default" | "info" | "warning" | "danger";
}

export function InfoPanel({
  title,
  description,
  content,
  tone = "info",
}: InfoPanelProps) {
  return (
    <Card tone={tone}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0 text-sm text-slate-700">
        {content}
      </CardContent>
    </Card>
  );
}
