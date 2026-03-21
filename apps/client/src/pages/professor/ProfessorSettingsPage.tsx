import { useContext } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export function ProfessorSettingsPage() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("ProfessorSettingsPage must be used within AuthProvider");
  }

  const fullName = auth.user
    ? `${auth.user.firstName} ${auth.user.lastName}`
    : "Profesor";

  return (
    <section className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Osobni podaci</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">
              Ime i prezime:{" "}
            </span>
            {fullName}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Uloga: </span>
            PROFESSOR
          </p>
          <Button onClick={auth.logout} variant="outline">
            Odjava
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
