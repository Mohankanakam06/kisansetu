"use client";
import React from "react";
import Link from "next/link";
import {
  Sprout,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Truck,
  Wallet,
  Globe2,
  Cpu,
  Database,
  Code2,
  Target,
  Sparkles,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useLanguage } from "@/lib/language";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 bg-[#fafbf9] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header / Hero */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>{t("SIH 2026 Problem Statement 26033 · Official Architecture", "SIH 2026 समस्या कथन 26033 · आधिकारिक वास्तुकला", "SIH 2026 समस्या बिबरन 26033")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-display tracking-tight leading-tight">
            {t(
              "Rebuilding India's Agricultural Supply Chain with AI",
              "AI के साथ भारत की कृषि आपूर्ति श्रृंखला का पुनर्निर्माण",
              "AI संग भारत के कृषि व्यापार ला नवा दिशा"
            )}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {t(
              "KisanSetu is an autonomous direct-to-market platform designed to eliminate the multi-tiered middlemen inefficiencies in India's agricultural supply chain, empowering smallholder farmers with fair pricing, instant AI quality grading, consolidated logistics, and zero-risk smart escrow.",
              "KisanSetu एक स्वायत्त डायरेक्ट-टू-मार्केट प्लेटफॉर्म है जिसे भारत की कृषि आपूर्ति श्रृंखला में बिचौलियों की अक्षमताओं को समाप्त करने, छोटे किसानों को उचित मूल्य, तत्काल AI गुणवत्ता ग्रेडिंग, संयुक्त रसद और शून्य-जोखिम स्मार्ट एस्क्रो के साथ सशक्त बनाने के लिए डिज़ाइन किया गया है।",
              "KisanSetu एक आधुनिक मंच हे जेमा बिचौलिया मन के झंझट खतम करके, किसान मन ला सही दाम, AI फोटो जांच, 1-गाड़ी ढुलाई आ तुरत बैंक पइसा देहे जाथे।"
            )}
          </p>
        </div>

        {/* The Problem We Solve vs Traditional Mandis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
              <Target className="w-3.5 h-3.5" />
              {t("The Core Problem Statement", "मूल समस्या कथन", "मूल समस्या बिबरन")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {t(
                "Why 86% of Indian Smallholders Lose Value in Mandis",
                "भारत के 86% छोटे किसान मंडियों में मूल्य क्यों खो देते हैं",
                "86% साना किसान मंडी म काबर घाटा खाथें"
              )}
            </h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="p-1 rounded-lg bg-red-50 text-red-600 mt-0.5 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">{t("Fragmented Produce Volume", "खंडित उपज मात्रा", "टुकड़ा-टुकड़ा फसल")}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      "Smallholder farmers (harvesting 200–500kg) cannot individually negotiate with large wholesale buyers or supermarket chains.",
                      "छोटे किसान (200-500 किलोग्राम उपज) सीधे बड़े थोक खरीदारों या सुपरमार्केट से बातचीत नहीं कर सकते।",
                      "साना किसान मन बड़े खरीदार ले सीधा सौदा नइ कर सकंय।"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="p-1 rounded-lg bg-red-50 text-red-600 mt-0.5 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">{t("Subjective Grading Cuts", "मनमानी गुणवत्ता कटौती", "व्यापारी के मनमर्जी भाव")}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      "Mandi traders downgrade crop quality visually without verifiable evidence, slashing farmer profits by 15% to 25%.",
                      "मंडी व्यापारी बिना किसी प्रमाण के दृष्टिगत रूप से फसल की गुणवत्ता घटाते हैं, जिससे किसान का 15% से 25% मुनाफा कट जाता है।",
                      "मंडी म व्यापारी मन फसल ला खराब बताके 15% ले 25% दाम काट देथें।"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="p-1 rounded-lg bg-red-50 text-red-600 mt-0.5 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">{t("Unorganized Logistics & Delayed Credit", "असंगठित रसद और उधारी भुगतान", "गाड़ी के भाड़ा आ उधारी")}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      "Empty return vehicle trips cause exorbitant freight rates, while payments are delayed by 15 to 45 days on credit.",
                      "खाली गाड़ियों की आवाजाही से माल ढुलाई महंगी होती है, और किसानों को 15 से 45 दिनों की उधारी झेलनी पड़ती है।",
                      "गाड़ी के भाड़ा जादा लगथे आ पइसा 15 ले 45 दिन उधारी म अटक जाथे।"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold border border-emerald-700">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              {t("The KisanSetu Solution", "KisanSetu समाधान", "KisanSetu के हल")}
            </div>

            <h3 className="text-2xl font-bold font-display text-white">
              {t(
                "An Autonomous Multi-Agent Market Network",
                "एक स्वायत्त मल्टी-एजेंट बाज़ार नेटवर्क",
                "4 AI एजेंट वाला आधुनिक डिजिटल मंच"
              )}
            </h3>

            <p className="text-emerald-100 text-sm leading-relaxed">
              {t(
                "Instead of human intermediaries charging excessive commissions, 4 autonomous software agents orchestrate aggregation, computerized vision grading, route optimization, and digital escrow payouts in real-time.",
                "मानव बिचौलियों द्वारा भारी कमीशन लेने के बजाय, 4 स्वायत्त सॉफ्टवेयर एजेंट रीयल-टाइम में एकत्रीकरण, कंप्यूटर विज़न ग्रेडिंग, रूट अनुकूलन और डिजिटल एस्क्रो भुगतान का प्रबंधन करते हैं।",
                "दलाल मन के जगह 4 AI एजेंट अपने आप फसल ला जोड़थें, फोटो ले क्वालिटी जांचथें, 1 गाड़ी म लोड कराथें आ बैंक म तुरत पइसा भेजथें।"
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60">
                <p className="text-2xl font-black font-mono text-amber-300">+28% to 35%</p>
                <p className="text-[11px] text-emerald-200 font-semibold mt-0.5">{t("Farmer Profit Realization", "किसान लाभ में वृद्धि", "किसान के जादा कमाई")}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60">
                <p className="text-2xl font-black font-mono text-emerald-300">72%</p>
                <p className="text-[11px] text-emerald-200 font-semibold mt-0.5">{t("Truck Mileage Saved", "ट्रक माइलेज की बचत", "गाड़ी माइलेज बचत")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Autonomous Agents Detail */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {t("Architectural Pillars", "वास्तुकला के स्तंभ", "सिस्टम के आधार")}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 font-display mt-3">
              {t("How the 4 Autonomous Agents Operate", "4 स्वायत्त एजेंट कैसे काम करते हैं", "4 AI एजेंट कइसे काम करथें")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    {t("1. Aggregation Agent (PostGIS + DBSCAN)", "1. एकत्रीकरण एजेंट (PostGIS + DBSCAN)", "1. जमा करइया एजेंट")}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">DBSCAN Spatial Clustering</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "Runs real-time spatial clustering on GPS coordinates within a 15km centroid radius. Automatically bundles 5–10 smallholder micro-listings into institutional-grade 2,000kg+ bulk lots ready for institutional purchase.",
                  "15 किमी के दायरे में जीपीएस निर्देशांकों पर स्थानिक क्लस्टरिंग चलाता है। 5-10 छोटे किसानों की उपज को 2,000 किग्रा+ के बड़े थोक लॉट में जोड़ता है।",
                  "15 किमी इलाका म सबो साना किसान मन के फसल ला मिलाके 2,000 किग्रा के बड़ा थोक लॉट बना देथे।"
                )}
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    {t("2. Quality Assessment Agent (Gemini Vision)", "2. गुणवत्ता एजेंट (Gemini विज़न)", "2. गुणवत्ता जांच एजेंट")}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Multimodal Computer Vision</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "Uses Google Gemini Vision models to inspect upload photos for ripeness, color distribution, bruising, and sizing defects. Computes deterministic Grade A/B/C/D ratings, giving buyers 100% purchase transparency.",
                  "गूगल Gemini विज़न मॉडल का उपयोग करके फसल की परिपक्वता, रंग, आकार और दोषों की जांच करता है और ग्रेड A/B/C/D प्रमाणन जारी करता है।",
                  "Gemini AI फोटो ले फसल के रंग, आकार आ खराबी जांच के ग्रेड A/B/C/D सर्टिफिकेट देथे।"
                )}
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    {t("3. Logistics & Routing Agent (VRP-TW)", "3. लॉजिस्टिक्स व रूटिंग एजेंट (VRP-TW)", "3. गाड़ी रूटिंग एजेंट")}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Vehicle Routing Problem with Time Windows</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "Synthesizes multiple farm pickup coordinates into an optimized 1-truck single-loop trajectory. Eliminates dead-mileage runs, saves up to 72% diesel fuel, and assigns verified transport drivers with live GPS tracking.",
                  "विभिन्न खेतों के पिकअप को 1-ट्रक सिंगल-लूप मार्ग में अनुकूलित करता है। खाली माइलेज समाप्त कर 72% तक ईंधन बचाता है और लाइव जीपीएस ट्रैकिंग प्रदान करता है।",
                  "सबो खेत के माल ला 1 गाड़ी म लोड करइया सबसे छोटा रास्ता बनाथे आ 72% डीजल बचाथे।"
                )}
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-base">
                    {t("4. Milestone Smart Escrow Agent", "4. माइलस्टोन स्मार्ट एस्क्रो एजेंट", "4. एस्क्रो पइसा एजेंट")}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">2-Stage UPI Automated Settlement</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  "Locks buyer funds upon order placement. Automatically triggers a 40% initial payout directly to farmer bank accounts upon truck dispatch, and releases the final 60% immediately upon digital OTP delivery sign-off.",
                  "ऑर्डर पर खरीदार का पैसा सुरक्षित रखता है। ट्रक रवानगी पर किसान के बैंक खाते में 40% और डिलीवरी पर शेष 60% तुरंत जारी करता है।",
                  "खरीदार के पइसा सुरक्षित रखके, माल गाड़ी म चढ़े म 40% आ खरीदार करा पहुंचे म 60% तुरत किसान के बैंक म भेज देथे।"
                )}
              </p>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {t("Engineering Stack", "इंजीनियरिंग स्टैक", "तकनीकी स्टैक")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-3">
              {t("Built on Modern, Resilient Technologies", "आधुनिक और मजबूत तकनीक पर निर्मित", "आधुनिक आ मजबूत तकनीक")}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { name: "Next.js 15", category: "Fullstack Framework", icon: Code2 },
              { name: "FastAPI", category: "Python AI Backend", icon: Cpu },
              { name: "PostgreSQL / PostGIS", category: "Spatial Geospatial DB", icon: Database },
              { name: "Google Gemini", category: "Multimodal AI Vision", icon: Sparkles },
              { name: "TailwindCSS", category: "Design System", icon: Code2 },
              { name: "WebSpeech API", category: "Voice Inclusivity", icon: Globe2 },
            ].map((tech, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-2">
                <div className="mx-auto h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <tech.icon className="h-5 w-5" />
                </div>
                <p className="font-bold text-xs text-slate-900">{tech.name}</p>
                <p className="text-[10px] text-slate-500">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display max-w-2xl mx-auto">
            {t(
              "Experience the Future of Agricultural Commerce Today",
              "आज ही कृषि व्यापार के भविष्य का अनुभव करें",
              "आज ही नवा कृषि व्यापार के अनुभव करव"
            )}
          </h2>
          <p className="text-emerald-200 text-sm max-w-xl mx-auto">
            {t(
              "Explore our live interactive prototype built for farmers, wholesale buyers, logistics operators, and evaluators.",
              "किसानों, थोक खरीदारों, रसद ऑपरेटरों और मूल्यांकनकर्ताओं के लिए बनाए गए हमारे लाइव प्रोटोटाइप का अन्वेषण करें।",
              "किसान, थोक खरीदार आ गाड़ी वाला मन बर बने लाइव सिस्टम ला देखव।"
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/farmer">
              <Button size="lg" variant="primary" className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-6 shadow-md">
                <Sprout className="w-4 h-4 mr-2 text-emerald-700" />
                {t("Sell Produce as Farmer", "किसान के रूप में फसल बेचें", "किसान बनके फसल बेचव")}
              </Button>
            </Link>
            <Link href="/buyer">
              <Button size="lg" variant="secondary" className="bg-emerald-900/80 text-white border-emerald-700 hover:bg-emerald-800 font-bold px-6">
                <ShieldCheck className="w-4 h-4 mr-2 text-amber-300" />
                {t("Explore Buyer Marketplace", "थोक मंडी बाज़ार देखें", "थोक बाजार देखव")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
