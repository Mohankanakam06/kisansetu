import { ShieldAlert } from "lucide-react";
import LegalPageLayout, { LegalSection, LegalParagraph } from "@/components/legal/LegalPageLayout";

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      updated="August 29, 2026"
      description="Liabilities and limitations of the KisanSetu demonstration."
      icon={ShieldAlert}
    >
      <LegalSection id="general" heading="1. General information">
        <LegalParagraph>
          KisanSetu is a hackathon prototype built for Smart India Hackathon 2026, Problem
          Statement 26033. Content shown (prices, lots, grading, logistics, and settlement records)
          may be generated or mock data intended to illustrate how the platform would behave when
          connected to live backends and payment gateways.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="not-advice" heading="2. Not advice">
        <LegalParagraph>
          Information on this site — including crop descriptions, prices per kg, grading rubrics,
          routing estimates, and settlement simulations — is for demonstration only. It is not
          professional agricultural, financial, legal, or logistics advice. Consult qualified
          professionals before making decisions.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="accuracy" heading="3. Accuracy & availability">
        <LegalParagraph>
          While we aim to keep information accurate, we make no representation or warranty about
          completeness, timeliness, or suitability of any data, listing, grade, or route. The site
          may be unavailable during judging, load testing, or maintenance without notice.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="external" heading="4. External links & trademarks">
        <LegalParagraph>
          References to Leaflet, OpenRouteService, Razorpay, Bhashini, or other services are for
          integration context; their trademarks belong to respective owners. External links (if any)
          are provided for convenience and do not imply endorsement.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="limitation" heading="5. Limitation of liability">
        <LegalParagraph>
          To the maximum extent permitted by law, KisanSetu and its contributors accept no
          liability for any loss or damage (direct, indirect, or consequential) arising from use of
          this demonstration — including loss of business or crop value — except where not
          permitted to be excluded under applicable law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="questions" heading="6. Questions">
        <LegalParagraph>
          For questions about this disclaimer, contact{" "}
          <span className="font-semibold text-on-surface">legal@kisansetu.example.in</span>.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}