import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../constants";

export interface BottomNavProps {
  items: NavigationItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white md:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {items.slice(0, 4).map((item) => (
          <li key={item.label}>
            <NavLink
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-slate-500",
                ].join(" ")
              }
              to={item.path}
            >
              <span className="text-sm">•</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
