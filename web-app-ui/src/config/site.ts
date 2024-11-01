export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vite + NextUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Problems",
      href: "/problems",
    },
    {
      label: "Stats",
      href: "/stats",
    },
  
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Problems",
      href: "/problems",
    },
    {
      label: "Stats",
      href: "/stats",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
