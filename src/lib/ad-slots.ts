export const AD_SLOT_DEFINITIONS = {
  leaderboard: {
    label: "Top Leaderboard",
    description: "Shows below the main navigation on the home page and tool pages.",
  },
  gridFeed: {
    label: "Home In-Feed",
    description: "Appears inside the marketplace grid after the featured tool blocks.",
  },
  engagement: {
    label: "Tool Sidebar",
    description: "Sits beside the workstation on desktop and below it on smaller screens.",
  },
  action: {
    label: "Post-Action",
    description: "Appears below the main result or download area after a task is complete.",
  },
  contentInline: {
    label: "Content Pages",
    description: "Reserved for About, Privacy, Terms, Security, Compliance, and Contact pages.",
  },
  stickyFooter: {
    label: "Footer Banner",
    description: "Anchored above the footer across the public site.",
  },
} as const;

export type AdSlotName = keyof typeof AD_SLOT_DEFINITIONS;

export const AD_SLOT_NAMES = Object.keys(AD_SLOT_DEFINITIONS) as AdSlotName[];
