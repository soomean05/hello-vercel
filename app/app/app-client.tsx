"use client";

import RateSection from "../components/RateSection";
import UploadSection from "../components/UploadSection";

type Item = {
  id: string | number;
  content: string;
  imageUrl: string | null;
};

export default function AppClient({ items }: { items: Item[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section>
        <RateSection items={items} />
      </section>
      <section>
        <UploadSection />
      </section>
    </div>
  );
}
