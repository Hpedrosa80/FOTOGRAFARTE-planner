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
        src: "/logo-fotografarte-corporate2.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-fotografarte-corporate2.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}