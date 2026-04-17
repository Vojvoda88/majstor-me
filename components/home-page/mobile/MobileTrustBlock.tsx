import { ShieldCheck, Star, Map } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "Verifikovani" },
  { icon: Star, text: "4,8 ocjena" },
  { icon: Map, text: "Cijela CG" },
];

export function MobileTrustBlock() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {TRUST_ITEMS.map(({ icon: Icon, text }) => (
        <div
          key={text}
          className="rounded-xl bg-white p-3 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        >
          <Icon className="mx-auto mb-1.5 h-5 w-5 text-[#2563EB]" />
          <span className="text-xs font-medium text-[#475569]">{text}</span>
        </div>
      ))}
    </div>
  );
}
