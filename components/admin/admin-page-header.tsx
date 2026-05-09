type AdminPageHeaderProps = {
  title: string;
  description?: string;
  meta?: string;
};

export function AdminPageHeader({ title, description, meta }: AdminPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
      {description ? <p className="text-sm text-[#64748B]">{description}</p> : null}
      {meta ? <p className="text-xs font-medium text-slate-500">{meta}</p> : null}
    </div>
  );
}
