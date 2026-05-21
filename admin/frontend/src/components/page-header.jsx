import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHeader({ breadcrumbs, title, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center flex-wrap">
            {breadcrumbs.map((crumb, index) => {
              const isFirst = index === 0;
              const isLast = index === breadcrumbs.length - 1;
              const textClass = isFirst 
                ? "text-2xl font-bold tracking-tight text-foreground" 
                : "text-[1.35rem] font-light text-muted-foreground tracking-wide mt-1";

              return (
                <div key={index} className="flex items-center">
                  {!isFirst && (
                    <ChevronRight className="mx-2 mt-1 h-4 w-4 text-muted-foreground/50" />
                  )}
                  {crumb.href ? (
                    <Link to={crumb.href} className={`${textClass} hover:text-foreground transition-colors`}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={textClass}>{crumb.label}</span>
                  )}
                </div>
              );
            })}
          </nav>
        ) : (
          title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
