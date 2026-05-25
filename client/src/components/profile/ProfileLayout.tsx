import React from 'react';
import Sidebar from './Sidebar';
import ProfileContent from './ProfileContent';

export default function ProfileLayout() {
  return (
    <div className="px-6 py-6 text-white">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </aside>
        <main className="w-full">
          <ProfileContent />
        </main>
      </div>
    </div>
  );
}
