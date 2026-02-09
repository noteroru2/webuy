// src/components/Breadcrumbs.tsx
import Link from "next/link";

type Crumb = {
  name: string;
  url: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      {items.map((it, i) => (
        <span key={it.url}>
          {i > 0 && " / "}
          <Link href={it.url} className="hover:underline">
            {it.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}
