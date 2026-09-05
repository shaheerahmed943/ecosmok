import { api } from "@/lib/api";
import PolicyPageLayout, { PolicyContent } from "@/components/policy/PolicyPageLayout";

interface SizeChartRow {
  size: string;
  chest: string;
  waist: string;
  hips: string;
  length: string;
}

interface SizeGuideContent extends PolicyContent {
  sizeChart: SizeChartRow[];
}

const DEFAULT_CONTENT: SizeGuideContent = {
  heading: "Size Guide",
  intro: "All measurements are in inches. If you're between sizes, we recommend sizing up for a relaxed fit.",
  sizeChart: [],
  sections: [],
};

export default async function SizeGuidePage() {
  const content = (await api.getSizeGuideContent().catch(() => null)) as SizeGuideContent | null;
  const { sizeChart, ...policyContent } = content ?? DEFAULT_CONTENT;

  return (
    <PolicyPageLayout content={policyContent}>
      {sizeChart.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F2EC] text-[#0A2540]">
              <tr>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Chest</th>
                <th className="px-4 py-3 font-semibold">Waist</th>
                <th className="px-4 py-3 font-semibold">Hips</th>
                <th className="px-4 py-3 font-semibold">Length</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row, idx) => (
                <tr key={idx} className="border-t border-neutral-200">
                  <td className="px-4 py-3 font-medium text-[#0A2540]">{row.size}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.chest}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.waist}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.hips}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PolicyPageLayout>
  );
}
