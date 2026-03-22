import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../constants";
import { getIcon } from "../../utils/icons";

export interface SidebarNavProps {
  items: NavigationItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <aside className="hidden sticky top-0 min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block overflow-y-auto">
      <h1 className="p-3 text-xl font-bold text-primary">ShiftModule</h1>
      <ul className="space-y-1">
        {items.map((item) => {
          const IconComponent = getIcon(item.icon);
          const isExternal = item.path.startsWith("http");

          return (
            <li key={item.label}>
              {isExternal ? (
                <a
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  href={item.path}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <IconComponent className="text-base flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              ) : (
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
                  <IconComponent className="text-base flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
