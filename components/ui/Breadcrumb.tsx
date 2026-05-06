import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 16 }}>
      <ol style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
        {crumbs.map((crumb, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && (
              <span style={{ color: "var(--mv-text-subtle)", fontSize: 12 }}>›</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{
                  fontSize: 13,
                  color: "var(--mv-text-muted)",
                  textDecoration: "none",
                  transition: "color 120ms ease",
                }}
                className="of-breadcrumb-link"
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{ fontSize: 13, color: "var(--mv-text)", fontWeight: 500 }} aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
