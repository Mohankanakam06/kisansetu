import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KisanSetu | Direct-to-Market Agri Platform",
    short_name: "KisanSetu",
    description: "AI-powered agricultural aggregation, grading, and direct-to-buyer marketplace",
    start_url: "/",
    display: "standalone",
    background_color: "#064e3b",
    theme_color: "#047857",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
