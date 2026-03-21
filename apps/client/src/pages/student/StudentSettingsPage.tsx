import { useContext } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";

export function StudentSettingsPage() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("StudentSettingsPage must be used within AuthProvider");
  }

  const fullName = auth.user
    ? `${auth.user.firstName} ${auth.user.lastName}`
    : "Student";

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
            STUDENT
          </p>
          <Button onClick={auth.logout} variant="outline">
            Odjava
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
