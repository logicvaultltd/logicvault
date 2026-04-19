import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  DatabaseZap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { AdSlot } from "@/components/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { type AppLocale, localizePath } from "@/lib/i18n";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo";

const ACCENT_STYLES = {
  red: {
    shell: "lv-accent-shell-red",
    badge: "lv-accent-badge-red",
    icon: "lv-neon-icon-shell lv-neon-electric text-vault-electric",
    ring: "lv-accent-ring-red",
  },
  blue: {
    shell: "lv-accent-shell-blue",
    badge: "lv-accent-badge-blue",
    icon: "lv-neon-icon-shell lv-neon-cobalt text-vault-cyan",
    ring: "lv-accent-ring-blue",
  },
  green: {
    shell: "lv-accent-shell-green",
    badge: "lv-accent-badge-green",
    icon: "lv-neon-icon-shell lv-neon-lime text-vault-lime",
    ring: "lv-accent-ring-green",
  },
  amber: {
    shell: "lv-accent-shell-amber",
    badge: "lv-accent-badge-orange",
    icon: "lv-neon-icon-shell lv-neon-cyan text-vault-cyan",
    ring: "lv-accent-ring-amber",
  },
  slate: {
    shell: "lv-accent-shell-slate",
    badge: "lv-accent-badge-slate",
    icon: "lv-neon-icon-shell lv-neon-cobalt text-vault-violet",
    ring: "lv-accent-ring-slate",
  },
} as const;

interface ContentShellProps {
  locale?: AppLocale | null;
  eyebrow: string;
  title: string;
  intro: string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENT_STYLES;
  highlights: string[];
  visualTitle: string;
  visualBody: string;
  path: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

export function ContentShell({
  locale = null,
  eyebrow,
  title,
  intro,
  icon: Icon,
  accent = "blue",
  highlights,
  visualTitle,
  visualBody,
  path,
  primaryAction,
  secondaryAction,
  children,
}: ContentShellProps) {
  const accentStyles = ACCENT_STYLES[accent];
  const assuranceCards = [
    {
      title: "Plain-language policy",
      body: "Every trust page is written for fast scanning, with direct statements before legal detail.",
      icon: CheckCircle2,
    },
    {
      title: "Data-minimal posture",
      body: "The platform favors narrow processing, short retention windows, and fewer hidden data paths.",
      icon: DatabaseZap,
    },
    {
      title: "Operational clarity",
      body: "Privacy, security, terms, and compliance are treated as active product surfaces.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="lv-page-shell px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildWebPageSchema({
            title,
            description: intro,
            path,
            locale,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/", locale },
            { name: title, path, locale },
          ]),
        ]}
      />
      <div className="mx-auto max-w-6xl">
        <section className={`lv-hero-shell ${accentStyles.shell} overflow-hidden rounded-[36px] p-6 sm:p-8`}>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${accentStyles.badge}`}
                >
                  {eyebrow}
                </span>
              <h1 className="lv-text-primary mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {title}
              </h1>
              <p className="lv-text-secondary mt-5 max-w-2xl text-base leading-8 sm:text-lg">
                {intro}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {primaryAction ? (
                  <Link
                    href={localizePath(primaryAction.href, locale)}
                    className="lv-button-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                  >
                    {primaryAction.label}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    href={localizePath(secondaryAction.href, locale)}
                    className="lv-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                  >
                    {secondaryAction.label}
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="lv-chip lv-text-secondary rounded-full px-4 py-2 text-sm shadow-sm"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="lv-surface relative overflow-hidden rounded-[32px] p-6">
                <div
                  className={`absolute -right-10 -top-10 size-36 rounded-full blur-2xl ${accentStyles.ring}`}
                />
                <div className="lv-divider absolute inset-x-6 bottom-6 top-24 rounded-[28px] border border-dashed" />

                <div className="relative">
                  <div
                    className={`inline-flex size-14 items-center justify-center rounded-2xl ${accentStyles.icon}`}
                  >
                    <Icon className="lv-neon-icon lv-icon-glow size-7" />
                  </div>
                  <p className="lv-text-primary mt-5 text-lg font-black">{visualTitle}</p>
                  <p className="lv-text-secondary mt-3 max-w-sm text-sm leading-7">{visualBody}</p>
                </div>

                <div className="relative mt-8 space-y-3">
                  {highlights.slice(0, 3).map((highlight, index) => (
                    <div
                      key={highlight}
                        className={`lv-surface-inset rounded-2xl px-4 py-3 shadow-sm ${
                          index === 1 ? "ml-5" : index === 2 ? "mr-5" : ""
                        }`}
                      >
                      <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.18em]">
                        Logic Vault
                      </p>
                      <p className="lv-text-secondary mt-2 text-sm font-medium">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <AdSlot slot="contentInline" className="mt-8" />

        <section className="lv-surface mt-8 rounded-[36px] p-5 sm:p-8">
          <div className="lv-surface-inset overflow-hidden rounded-[30px] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
              <div>
                <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
                  Trust architecture
                </p>
                <h2 className="lv-text-primary mt-3 text-3xl font-black tracking-[-0.04em]">
                  Policies designed like product workflows
                </h2>
                <p className="lv-text-secondary mt-4 text-sm leading-8">
                  These pages should feel as usable as the tools themselves. Instead of plain
                  static text, each policy section is organized around readable commitments,
                  practical boundaries, and clear operating notes that help visitors understand how
                  Logic Vault handles sensitive financial workflows.
                </p>
              </div>

              <div className="grid gap-4">
                {assuranceCards.map((card) => {
                  const CardIcon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="lv-surface rounded-[24px] p-5 shadow-sm backdrop-blur"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${accentStyles.icon}`}
                        >
                          <CardIcon className="lv-neon-icon lv-icon-glow size-5" />
                        </span>
                        <div>
                          <p className="lv-text-primary text-sm font-bold">{card.title}</p>
                          <p className="lv-text-secondary mt-2 text-sm leading-7">{card.body}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="lv-content-notes lv-text-secondary mt-8 space-y-6 text-sm leading-8">
          {children}
        </div>
      </div>
    </main>
  );
}
