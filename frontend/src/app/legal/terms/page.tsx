import { Scale } from "lucide-react";
import LegalPageLayout, { LegalSection, LegalParagraph, LegalList } from "@/components/legal/LegalPageLayout";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      updated="August 29, 2026"
      description="The terms governing your use of the KisanSetu platform."
      icon={Scale}
    >
      <LegalSection id="acceptance" heading="1. Acceptance of Terms">
        <LegalParagraph>
          By registering or using KisanSetu you agree to these Terms of Service. If you disagree,
          please do not use the platform. These terms form a binding agreement between you and
          KisanSetu (SIH 2026, Problem Statement 26033).
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="accounts" heading="2. Accounts & Eligibility">
        <LegalList
          items={[
            <>You must be at least 18 years old and provide accurate registration details (name, verified mobile number, location).</>,
            <>Each account is personal. You are responsible for activity under your account and for keeping your OTP/credentials private.</>,
            <>Farmers represent that produce listed is theirs or that they are authorized to sell it. Buyers represent they have authority to transact.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="listing-grading" heading="3. Listing, Aggregation & Grading">
        <LegalParagraph>
          When you list produce, our aggregation agent may merge your listing with nearby listings
          of the same crop into an aggregated lot. AI grading assigns a quality grade (A/B/C) based
          on photo analysis. Grades are indicative, not a guarantee of physical condition at pickup.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="orders" heading="4. Orders, Logistics & Settlement">
        <LegalList
          items={[
            <>Orders are placed against aggregated lots; routing is planned by the forecast & routing agent.</>,
            <>Farmers accept settlement on the milestone model: 40% at pickup, 60% on delivery, disbursed to the UPI ID on record.</>,
            <>KisanSetu holds escrowed funds and is not a bank. Delay in UPI settlement does not constitute breach where caused by gateway or bank failure.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="prohibited" heading="5. Prohibited Conduct">
        <LegalList
          items={[
            <>Manipulating grades, listing false quantities, or colluding to distort lot pricing.</>,
            <>Uploading offensive, infringing, or non-consensual images or content.</>,
            <>Attempting to access another user's account or disrupt platform operations.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="liability" heading="6. Liability & Disclaimers">
        <LegalParagraph>
          The platform is provided "as is" for a hackathon demonstration. To the extent permitted by
          law, KisanSetu is not liable for indirect or consequential losses, including crop spoilage
          or price fluctuation. Your statutory rights remain unaffected.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="changes" heading="7. Changes & Termination">
        <LegalParagraph>
          We may update these terms (with notice) or suspend accounts that breach them. Users may
          close their account at any time from Account Settings.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}