export default function Empty({ title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
      <div className="text-base font-semibold text-stone-900">{title}</div>
      {message && <p className="mt-1 text-sm text-stone-600">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
