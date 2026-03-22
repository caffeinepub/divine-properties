export default function FormSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div
        className="px-5 py-3 border-b border-border"
        style={{ background: "oklch(0.95 0 0)" }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: "oklch(0.55 0.13 75)" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
