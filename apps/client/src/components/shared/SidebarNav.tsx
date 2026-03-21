import { NavLink } from "react-router-dom";
import { useContext } from "react";
import type { NavigationItem } from "../../constants";
import { AuthContext } from "../../context/AuthContext";
import { getIcon } from "../../utils/icons";

export interface SidebarNavProps {
  items: NavigationItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const auth = useContext(AuthContext);
  const displayName = auth?.user
    ? `${auth.user.firstName} ${auth.user.lastName}`
    : "ShiftModule";

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <h1 className="p-3 text-xl font-bold">{displayName}</h1>
      <ul className="space-y-1">
        {items.map((item) => {
          const IconComponent = getIcon(item.icon);
          const isExternal = item.path.startsWith("http");

          // TODO: future - SSO passthrough to auto-login user to Merlin
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
