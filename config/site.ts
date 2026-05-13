export const siteConfig = {
  name: "ProjectM Admin",
  url: "",
  ogImage: "",
  description: "ProjectM platform administration.",
  links: {
    youtube: "https://www.youtube.com",
    twitter: "https://twitter.com",
  },
};

export const siteUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080";
// export const siteUrl = "https://your-production-api.com";

export type SiteConfig = typeof siteConfig;
