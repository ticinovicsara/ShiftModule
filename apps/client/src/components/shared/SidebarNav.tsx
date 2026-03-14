import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../constants";

export interface SidebarNavProps {
  items: NavigationItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")
              }
              to={item.path}
            >
              <span className="text-xs">●</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
