import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, className, icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white py-16 px-8 text-center",
        className
      )}
    >
      <div className="mb-4">
        {icon ?? (
          <svg className="mx-auto h-12 w-12 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <p className="text-base font-medium text-[#1E293B]">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[#64748B]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
