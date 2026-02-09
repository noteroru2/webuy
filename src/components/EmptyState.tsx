import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  actionExternal?: boolean;
};

export function EmptyState({
  title,
  description,
  icon = "📦",
  actionLabel,
  actionHref,
  actionExternal = false,
}: EmptyStateProps) {
  return (
    <div className="card card-pad text-center">
      <div className="text-4xl">{icon}</div>
      <div className="mt-4 text-sm font-extrabold">{title}</div>
      <div className="muted mt-1 text-sm">{description}</div>
      {actionLabel && actionHref && (
        <div className="mt-4">
          {actionExternal ? (
            <a
              href={actionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {actionLabel}
            </a>
          ) : (
            <Link href={actionHref} className="btn btn-primary">
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
