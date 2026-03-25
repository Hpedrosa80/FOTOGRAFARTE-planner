import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fotografarte Wedding Planner",
    short_name: "Fotografarte",
    description: "Organiza os teus casamentos",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1ea",
    theme_color: "#8c6a43",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}