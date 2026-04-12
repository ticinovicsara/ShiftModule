import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { SearchField } from "./SearchField";
import { studentApi } from "../../api";
import { AuthContext } from "../../context/AuthContext";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentGroupId?: string;
}

export interface StudentPartnerSearchInputProps {
  courseId: string;
  desiredGroupId: string;
  sessionTypeId?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (email: string, studentName: string) => void;
}

export function StudentPartnerSearchInput({
  courseId,
  desiredGroupId,
  sessionTypeId,
  value,
  onChange,
  onSelect,
}: StudentPartnerSearchInputProps) {
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!courseId || !userId) {
      setStudents([]);
      return;
    }

    let isActive = true;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const classmates = await studentApi.getCourseStudents(
          courseId,
          sessionTypeId,
        );
        if (isActive) {
          setStudents(classmates);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        if (isActive) {
          setStudents([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void fetchStudents();

    return () => {
      isActive = false;
    };
  }, [courseId, sessionTypeId, userId]);

  useEffect(() => {
    const query = value.toLowerCase().trim();
    if (query.length < 2) {
      setFilteredStudents([]);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.currentGroupId === desiredGroupId &&
        (student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)),
    );
    setFilteredStudents(filtered);
  }, [desiredGroupId, students, value]);

  // Keep filtering synchronous for immediate UI feedback.
  const handleSearch = useCallback(
    (query: string) => {
      onChange(query);

      // If query is too short, hide dropdown
      if (query.trim().length < 2) {
        setFilteredStudents([]);
        setShowDropdown(false);
        return;
      }

      setShowDropdown(true);
    },
    [onChange],
  );

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStudent = (student: Student) => {
    const displayName = `${student.firstName} ${student.lastName}`;
    onSelect(student.email, displayName);
    onChange(displayName);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <SearchField
        label="Partner za zamjenu *"
        placeholder="Počni pisati ime ili email..."
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        hint="Pretraživanje studenata iz istog kolegija"
        autoComplete="off"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              Učitavanje...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              Nema rezultata
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {filteredStudents.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {student.email}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
