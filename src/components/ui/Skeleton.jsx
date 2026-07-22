import React from 'react';

// ---- REUSABLE SKELETON COMPONENT LOADERS ----

export function SkeletonItemCard({ count = 3 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm animate-pulse space-y-3">
          <div className="h-44 w-full rounded-xl bg-stone-200" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 rounded bg-stone-200" />
            <div className="h-3 w-12 rounded bg-stone-200" />
          </div>
          <div className="h-5 w-3/4 rounded bg-stone-200" />
          <div className="h-3 w-full rounded bg-stone-100" />
          <div className="h-3 w-2/3 rounded bg-stone-100" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-20 rounded bg-stone-200" />
            <div className="h-9 w-24 rounded-xl bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMenuItemCard({ count = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm animate-pulse space-y-3">
          <div className="h-36 w-full rounded-xl bg-stone-200" />
          <div className="h-4 w-2/3 rounded bg-stone-200" />
          <div className="h-3 w-full rounded bg-stone-100" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-5 w-16 rounded bg-stone-200" />
            <div className="h-8 w-20 rounded-xl bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDealCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 sm:p-12 shadow-xl animate-pulse">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        <div className="h-64 md:h-80 rounded-2xl bg-stone-200" />
        <div className="space-y-4">
          <div className="h-4 w-28 rounded bg-stone-200" />
          <div className="h-8 w-3/4 rounded bg-stone-200" />
          <div className="h-3.5 w-full rounded bg-stone-100" />
          <div className="h-3.5 w-4/5 rounded bg-stone-100" />
          <div className="h-8 w-36 rounded bg-stone-200 pt-2" />
          <div className="h-10 w-32 rounded-xl bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMenuPage() {
  return (
    <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-8 space-y-10 animate-pulse">
      <div className="h-36 w-full rounded-2xl bg-stone-900" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-stone-200 shrink-0" />
        ))}
      </div>
      <SkeletonMenuItemCard count={8} />
    </div>
  );
}

export function SkeletonAboutPage() {
  return (
    <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-8 space-y-12 animate-pulse">
      <div className="h-48 w-full rounded-3xl bg-stone-900" />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="h-64 rounded-2xl bg-stone-200" />
        <div className="h-64 rounded-2xl bg-stone-200" />
      </div>
    </div>
  );
}

export function SkeletonContactPage() {
  return (
    <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-8 space-y-10 animate-pulse">
      <div className="h-48 w-full rounded-3xl bg-stone-900" />
      <div className="grid gap-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-stone-200" />
        ))}
      </div>
    </div>
  );
}
