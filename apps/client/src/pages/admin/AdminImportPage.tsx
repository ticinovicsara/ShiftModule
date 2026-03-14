import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "../../components/ui";
import { LABELS } from "../../constants";
import { useStudents } from "../../hooks";
import { UserRole } from "@repo/types";

export function AdminImportPage() {
  const { importStudents } = useStudents();
  const [email, setEmail] = useState("");

  const handleImport = async () => {
    await importStudents([
      {
        email,
        firstName: "Ime",
        lastName: "Prezime",
        role: UserRole.STUDENT,
      },
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{LABELS.pages.adminImport}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Input
          label={LABELS.auth.email}
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
        <Button onClick={handleImport}>{LABELS.common.import}</Button>
      </CardContent>
    </Card>
  );
}
