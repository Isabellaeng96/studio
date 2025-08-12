"use client";

import Link from 'next/link';
import { AppSidebarNav } from './sidebar-nav';
import { Logo } from '../logo';

export function AppSidebar() {
  return (
    <aside className="hidden lg:block lg:w-64 border-r">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <AppSidebarNav />
        </div>
      </div>
    </aside>
  );
}
