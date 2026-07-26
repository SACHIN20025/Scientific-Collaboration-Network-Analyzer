export default function StatusBadge({ value }) {
  if (!value) return null;
  const cls = `badge badge-${value}`;
  return <span className={cls}>{value.replace("_", " ")}</span>;
}
