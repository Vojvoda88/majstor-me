type Props = {
  value: string | number;
  label: string;
};

export function PremiumStatCard({ value, label }: Props) {
  return (
    <div className="rounded-[18px] border border-[#E7EDF5] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      <p className="mt-0.5 text-[13px] text-[#64748B]">{label}</p>
    </div>
  );
}
