// The docs sidebar, in reading order. Prev/next links follow this order too.
export const docsNav: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Getting started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/first-deploy", label: "Your first deploy" },
      { href: "/docs/github", label: "Connecting GitHub" },
    ],
  },
  {
    title: "Sites",
    items: [
      { href: "/docs/sites", label: "Creating and managing sites" },
      { href: "/docs/deploys", label: "How deploys work" },
      { href: "/docs/deploy-script", label: "The deploy script" },
      { href: "/docs/environment-variables", label: "Environment variables" },
      { href: "/docs/environments", label: "Staging and environments" },
      { href: "/docs/commands-and-logs", label: "Commands and logs" },
      { href: "/docs/https", label: "Domains and HTTPS" },
    ],
  },
  {
    title: "Stacks",
    items: [
      { href: "/docs/laravel", label: "Laravel and PHP" },
      { href: "/docs/javascript", label: "JavaScript apps and static sites" },
      { href: "/docs/python", label: "Python apps" },
    ],
  },
  {
    title: "Data",
    items: [
      { href: "/docs/databases", label: "Databases and Redis" },
      { href: "/docs/backups", label: "Backups and restores" },
      { href: "/docs/importing", label: "Importing a database" },
      { href: "/docs/moving-servers", label: "Moving to a new server" },
    ],
  },
  {
    title: "Server",
    items: [
      { href: "/docs/server", label: "Server and services" },
      { href: "/docs/panel", label: "The panel's address" },
      { href: "/docs/security", label: "Security" },
      { href: "/docs/updating", label: "Updating Skiff" },
      { href: "/docs/cli", label: "Command line" },
      { href: "/docs/troubleshooting", label: "Troubleshooting" },
    ],
  },
];
