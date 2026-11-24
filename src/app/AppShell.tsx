import { NavLink, Outlet } from 'react-router'

const tabs = [
  {
    to: '/app/tonight',
    label: 'Tonight',
    icon: <path d="M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-5 3-7 6-11z" />,
  },
  { to: '/app/chats', label: 'Chats', icon: <path d="M4 5h16v11H8l-4 4z" /> },
  {
    to: '/app/you',
    label: 'You',
    icon: (
      <>
        <rect x="4" y="3" width="10" height="14" rx="2" transform="rotate(-8 9 10)" />
        <rect x="10" y="7" width="10" height="14" rx="2" transform="rotate(8 15 14)" />
      </>
    ),
  },
]

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg text-text">
      <main className="flex-1 px-6 pt-6">
        <Outlet />
      </main>
      <nav
        aria-label="Main"
        className="sticky bottom-0 z-10 grid grid-cols-3 border-t border-border bg-bg/95 px-6 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex min-h-11 flex-col items-center gap-1 py-1.5 text-[11px] ${
                isActive ? 'font-bold text-text' : 'font-medium text-muted'
              }`
            }
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {tab.icon}
            </svg>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
