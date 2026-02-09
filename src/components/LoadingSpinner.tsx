export function LoadingSpinner({ text = "กำลังโหลด..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="spinner" />
      <div className="mt-4 text-sm text-slate-600">{text}</div>
    </div>
  );
}
