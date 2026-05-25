import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const items = [
    { to: '/profile', label: 'Overview', id: 'overview' },
    { to: '/profile/settings', label: 'Settings', id: 'settings' },
    { to: '/profile/security', label: 'Security', id: 'security' },
  ];

  return (
    <nav className="bg-[rgba(10,10,16,0.95)] border rounded-lg p-3 border-[var(--color-border-subtle)]">
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <NavLink
              to={it.to}
              end={it.to === '/profile'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm no-underline ${
                  isActive ? 'text-[var(--color-pulse)] bg-[var(--color-pulse-50)]' : 'text-[var(--color-muted-strong)] hover:bg-[rgba(255,255,255,0.02)]'
                }`
              }
            >
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
