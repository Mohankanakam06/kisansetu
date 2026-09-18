import { Accessibility } from "lucide-react";
import LegalPageLayout, { LegalSection, LegalParagraph, LegalList } from "@/components/legal/LegalPageLayout";

export default function AccessibilityStatementPage() {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      updated="August 29, 2026"
      description="Our commitment to making KisanSetu usable by everyone, including farmers who may be new to digital tools."
      icon={Accessibility}
    >
      <LegalSection id="commitment" heading="1. Our commitment">
        <LegalParagraph>
          KisanSetu aims to meet WCAG 2.1 AA as closely as possible within a hackathon timeline. We
          treat accessibility as core to the product because our target users — smallholder farmers
          — often rely on low-end devices, shared phones, and non-native-language interfaces.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="features" heading="2. What we&apos;ve built in">
        <LegalList
          items={[
            <>Skip-to-content link and logical, keyboard-accessible navigation.</>,
            <>Contrast ratios that meet AA on primary text and interactive controls.</>,
            <>Semantic HTML landmarks and aria labels on icon buttons and role toggles.</>,
            <>Multilingual support (हिन्दी / छत्तीसगढ़ी / English) for core flows.</>,
            <>Large tap targets, high-contrast emoji/icon labels, and clear error messages.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="known" heading="3. Known limitations">
        <LegalParagraph>
          The interactive Leaflet map is not fully operable by keyboard alone, and some
          dynamically-loaded demo dialogs may not surface every focus state. The interactive map is
          provided in addition to the sortable lot list, so every lot can be reached without it.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="feedback" heading="4. Feedback">
        <LegalParagraph>
          Found a barrier? Write to{" "}
          <span className="font-semibold text-on-surface">accessibility@kisansetu.example.in</span>.
          We respond within 5 business days and treat reports during SIH judging with priority.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}