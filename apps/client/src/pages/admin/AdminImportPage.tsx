import type { CreateUserDto } from "@repo/types";
import { UserRole } from "@repo/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ImportPreviewTable } from "../../components/shared";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { LABELS } from "../../constants";
import { useStudents } from "../../hooks";

interface ParsedImportRow {
  id: string;
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  valid: boolean;
  error?: string;
}

export function AdminImportPage() {
  const { importStudents } = useStudents();
  const [jsonInput, setJsonInput] = useState("[]");

  const { parsedRows, parseError, validRows } = useMemo(() => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return {
        parsedRows: [] as ParsedImportRow[],
        parseError: "JSON format nije valjan.",
        validRows: [] as CreateUserDto[],
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        parsedRows: [] as ParsedImportRow[],
        parseError: "JSON mora biti lista studenata.",
        validRows: [] as CreateUserDto[],
      };
    }

    const mappedRows = parsed.map((item, index): ParsedImportRow => {
      const row = item as Partial<CreateUserDto>;
      const email = typeof row.email === "string" ? row.email.trim() : "";
      const firstName =
        typeof row.firstName === "string" ? row.firstName.trim() : "";
      const lastName =
        typeof row.lastName === "string" ? row.lastName.trim() : "";
      const role = row.role ?? UserRole.STUDENT;
      const rowErrors: string[] = [];

      if (!firstName) {
        rowErrors.push("Nedostaje ime");
      }

      if (!lastName) {
        rowErrors.push("Nedostaje prezime");
      }

      if (!email || !email.includes("@")) {
        rowErrors.push("E-mail nije valjan");
      }

      if (role !== UserRole.STUDENT) {
        rowErrors.push("Dozvoljena je samo STUDENT uloga");
      }

      return {
        id: `row-${index + 1}`,
        rowNumber: index + 1,
        firstName,
        lastName,
        email,
        role,
        valid: rowErrors.length === 0,
        error: rowErrors.length ? rowErrors.join(", ") : undefined,
      };
    });

    const rowsToImport = mappedRows
      .filter((row) => row.valid)
      .map(
        (row): CreateUserDto => ({
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          role: UserRole.STUDENT,
        }),
      );

    return {
      parsedRows: mappedRows,
      parseError: null,
      validRows: rowsToImport,
    };
  }, [jsonInput]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput) as unknown;
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch {
      return;
    }
  };

  const handleImport = async () => {
    if (!validRows.length) {
      return;
    }

    try {
      await importStudents(validRows);
      toast.success("Uvoz studenata je uspješno dovršen.");
    } catch (importError) {
      toast.error(
        importError instanceof Error
          ? importError.message
          : "Uvoz studenata nije uspio.",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{LABELS.pages.adminImport}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">JSON</span>
            <textarea
              className="min-h-72 rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              onChange={(event) => setJsonInput(event.target.value)}
              placeholder='[{"email":"student@fesb.hr","firstName":"Ivo","lastName":"Ivic","role":"STUDENT"}]'
              value={jsonInput}
            />
          </label>
          {parseError ? (
            <p className="text-xs font-medium text-danger">{parseError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFormat} variant="secondary">
              Format JSON
            </Button>
            <Button
              disabled={!validRows.length || Boolean(parseError)}
              onClick={handleImport}
            >
              {LABELS.common.import}
            </Button>
          </div>
        </section>

        <ImportPreviewTable rows={parsedRows} />
      </CardContent>
    </Card>
  );
}
