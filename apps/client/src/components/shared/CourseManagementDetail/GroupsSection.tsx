import { SessionKind } from "@repo/types";
import { SESSION_TYPE_TABS } from "../../../constants";
import { Badge, Button, Input, Select } from "../../ui";
import type { CourseGroup } from "../../../types";

interface GroupsSectionProps {
  groupsSessionKind: SessionKind;
  setGroupsSessionKind: (kind: SessionKind) => void;
  selectedGroupIdForCapacity: string;
  setSelectedGroupIdForCapacity: (groupId: string) => void;
  groupsForCapacityKind: CourseGroup[];
  selectedGroupForCapacity: CourseGroup | null;
  selectedCapacity: number;
  hasCapacityWarning: boolean;
  issueDescription: string;
  setIssueDescription: (value: string) => void;
  issueReported: boolean;
  reportingIssue: boolean;
  onCapacityChange: (groupId: string, nextCapacity: number) => void;
  onSaveCapacity: (group: CourseGroup) => Promise<void>;
  onSendIssueReport: () => Promise<void>;
}

export function GroupsSection({
  groupsSessionKind,
  setGroupsSessionKind,
  selectedGroupIdForCapacity,
  setSelectedGroupIdForCapacity,
  groupsForCapacityKind,
  selectedGroupForCapacity,
  selectedCapacity,
  hasCapacityWarning,
  issueDescription,
  setIssueDescription,
  issueReported,
  reportingIssue,
  onCapacityChange,
  onSaveCapacity,
  onSendIssueReport,
}: GroupsSectionProps) {
  return (
    <section className="grid gap-4">
      <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Uređivanje kapaciteta grupe
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Tip vježbe"
            value={groupsSessionKind}
            onValueChange={(value) => {
              setGroupsSessionKind(value as SessionKind);
              setSelectedGroupIdForCapacity("");
            }}
            options={SESSION_TYPE_TABS.map((tab) => ({
              label: tab.label,
              value: tab.value,
            }))}
          />

          <Select
            label="Grupa"
            value={selectedGroupIdForCapacity}
            onValueChange={setSelectedGroupIdForCapacity}
            options={groupsForCapacityKind.map((group) => ({
              label: group.name,
              value: group.id,
              description: `${group.currentCount}/${group.capacity}`,
            }))}
          />
        </div>

        {selectedGroupForCapacity ? (
          <div className="grid gap-3 border-t border-slate-200 pt-3">
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              Trenutno studenata: {selectedGroupForCapacity.currentCount}
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
              <Input
                hint={
                  hasCapacityWarning
                    ? `Kapacitet je manji od trenutnog broja (${selectedGroupForCapacity.currentCount}).`
                    : `Trenutno: ${selectedGroupForCapacity.currentCount} studenata`
                }
                label="Maksimalni kapacitet"
                onChange={(event) =>
                  onCapacityChange(
                    selectedGroupForCapacity.id,
                    Number(
                      event.target.value || selectedGroupForCapacity.capacity,
                    ),
                  )
                }
                type="number"
                value={String(selectedCapacity)}
              />
              <Button
                disabled={hasCapacityWarning}
                onClick={() => void onSaveCapacity(selectedGroupForCapacity)}
                size="sm"
                variant="outline"
              >
                Spremi kapacitet
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Odaberite grupu za uređivanje.
          </p>
        )}
      </article>

      <article className="grid gap-3 rounded-2xl border border-red-300 bg-red-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-red-900">
            Prijava kvara IT podršci
          </h3>
          {issueReported ? (
            <Badge size="sm" variant="warning">
              IT PRIJAVA POSLANA
            </Badge>
          ) : null}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-red-900">
            Opis problema
          </span>
          <textarea
            className="min-h-28 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-slate-900"
            onChange={(event) => setIssueDescription(event.target.value)}
            placeholder="Opišite gdje se nalazi kvar — dvorana, oprema, opis problema..."
            value={issueDescription}
          />
        </label>

        <div className="flex justify-end">
          <Button
            onClick={() => void onSendIssueReport()}
            size="sm"
            variant="danger"
            disabled={!issueDescription.trim() || reportingIssue}
          >
            {reportingIssue ? "Šaljem..." : "Pošalji IT prijavu"}
          </Button>
        </div>
      </article>
    </section>
  );
}
