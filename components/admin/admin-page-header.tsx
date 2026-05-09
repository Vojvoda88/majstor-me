type AdminPageHeaderProps = {
  title: string;
  description?: string;
  meta?: string;
};

export function AdminPageHeader({ title, description, meta }: AdminPageHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{title}</h1>
        {description ? <p className="text-sm text-[#64748B]">{description}</p> : null}
        {meta ? <p className="text-xs font-semibold text-slate-500">{meta}</p> : null}
      </div>
    </div>
  );
}
