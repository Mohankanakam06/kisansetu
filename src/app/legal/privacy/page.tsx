import { ShieldCheck } from "lucide-react";
import LegalPageLayout, { LegalSection, LegalParagraph, LegalList } from "@/components/legal/LegalPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      updated="August 29, 2026"
      description="How KisanSetu collects, uses, and protects your personal and agricultural data."
      icon={ShieldCheck}
    >
      <LegalSection id="overview" heading="1. Overview">
        <LegalParagraph>
          KisanSetu ("we", "our") operates a direct-to-market agricultural platform that connects
          farmers and buyers through AI-powered aggregation, quality grading, logistics routing, and
          settlement. This Privacy Policy explains what data we collect, why we collect it, and the
          rights you have over it, under India&apos;s Digital Personal Data Protection Act (DPDPA) 2023
          and applicable UIDAI guidelines.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="data-collected" heading="2. Data We Collect">
        <LegalParagraph>We collect the following categories of data:</LegalParagraph>
        <LegalList
          items={[
            <>Identity data — name, mobile number (verified via OTP), language preference, optional Aadhaar number for purpose-limited identity verification.</>,
            <>Agricultural data — crop type, quantity, price expectation, harvest photos, geo-location of farm/village, and aggregation cluster membership.</>,
            <>Transaction data — order history, lot assignments, quality grades, route plans, and settlement/payout records.</>,
            <>Technical data — device/IP information, browser type, and cookies (see our Cookie Policy).</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="use" heading="3. How We Use Data">
        <LegalList
          items={[
            <>To enable geo-aggregation of smallholder listings into buyer-scale lots, and notify you when your lot is matched.</>,
            <>To run the AI quality-grading agent on photos you upload and share grades with relevant buyers on lots you join.</>,
            <>To compute optimized multi-pickup routes and forecast demand per crop and region.</>,
            <>To execute farmer payouts via UPI and reconcile settlement records for buyers and farmers.</>,
            <>For service improvement, fraud prevention, and legal compliance. We never sell personally identifiable data to third parties.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="sharing" heading="4. When We Share Data">
        <LegalParagraph>
          We only share data with partners essential to the service: payment gateways (for UPI
          settlement), SMS/WhatsApp providers (for OTP and status alerts), and AI/vision model hosts
          (for grading photos). Aggregated, de-identified data may be shared with the Ministry of
          Consumer Affairs for public-interest analysis.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="retention" heading="5. Retention & Deletion">
        <LegalParagraph>
          Transaction and payout records are retained for 8 years for statutory tax purposes.
          Listing photos and AI grading artifacts are retained for 3 years. You may request deletion
          of your personal data at any time by writing to the Data Protection Officer; deletion will
          not affect records we are legally required to keep.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="rights" heading="6. Your Rights">
        <LegalList
          items={[
            <>Access — request a copy of personal data we hold about you.</>,
            <>Correction — update your name, phone, location, or UPI ID from Account Settings.</>,
            <>Erasure — request removal of data no longer needed for the service.</>,
            <>Grievance — file a complaint with our Grievance Officer for resolution within stipulated timelines.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="contact" heading="7. Contact & Grievance Officer">
        <LegalParagraph>
          For any privacy question or complaint:{" "}
          <span className="font-semibold text-on-surface">privacy@kisansetu.example.in</span> · Grievance
          Officer, KisanSetu Direct-to-Market Agri Platform, SIH 2026, PS 26033.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}