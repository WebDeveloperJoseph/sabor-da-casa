export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fff7ea] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 h-44 rounded-3xl bg-[#f4e6d2] anim-shimmer" />

        <div className="mb-5 h-14 rounded-full bg-[#f4e6d2] anim-shimmer" />

        <div className="mb-8 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-12 w-28 shrink-0 rounded-2xl bg-[#f4e6d2] anim-shimmer"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-[#eadfd3] bg-white p-3"
            >
              <div className="grid min-h-[164px] grid-cols-[42%_1fr] gap-3 sm:grid-cols-[220px_1fr]">
                <div className="rounded-xl bg-[#f4e6d2] anim-shimmer" />
                <div className="space-y-3 py-1">
                  <div className="h-6 w-2/3 rounded-lg bg-[#f4e6d2] anim-shimmer" />
                  <div className="h-4 w-full rounded bg-[#f4e6d2] anim-shimmer" />
                  <div className="h-4 w-5/6 rounded bg-[#f4e6d2] anim-shimmer" />
                  <div className="mt-6 h-10 w-32 rounded-xl bg-[#f4e6d2] anim-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
