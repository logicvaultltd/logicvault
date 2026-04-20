"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { MathCaptchaChallenge } from "@/lib/security";

const PURPOSE_OPTIONS = [
  "General Inquiry",
  "Partnership",
  "Ad Placement",
  "Technical Support",
  "Enterprise Workflow",
  "Press & Media",
] as const;

const baseInputClassName =
  "lv-input-base w-full rounded-2xl px-4 py-3 text-sm outline-none transition";

interface ContactResponse {
  ok: boolean;
  mode?: "smtp" | "noop";
  message?: string;
  challenge?: MathCaptchaChallenge;
}

export function ContactForm() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    company: "",
    purpose: PURPOSE_OPTIONS[0],
    message: "",
    website: "",
    captchaAnswer: "",
  });
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [challenge, setChallenge] = useState<MathCaptchaChallenge | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const updateField = (name: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const loadChallenge = async () => {
    setIsLoadingChallenge(true);

    try {
      const response = await fetch("/api/contact/", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as ContactResponse;

      if (!response.ok || !payload.challenge) {
        throw new Error("Could not load the security challenge.");
      }

      setChallenge(payload.challenge);
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not load the security challenge right now.",
      });
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  useEffect(() => {
    void loadChallenge();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const isHumanVerified = useMemo(() => {
    if (!challenge) {
      return false;
    }

    return Number(formValues.captchaAnswer) === challenge.left + challenge.right;
  }, [challenge, formValues.captchaAnswer]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!challenge) {
      setStatus({
        tone: "error",
        message: "The security challenge is still loading. Please wait a moment.",
      });
      return;
    }

    setIsSending(true);
    setStatus(null);
    setToastMessage(null);

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          captchaLeft: challenge.left,
          captchaRight: challenge.right,
          captchaToken: challenge.token,
        }),
      });

      const payload = (await response.json()) as ContactResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "We could not send your message right now.");
      }

      setToastMessage(
        payload.message ??
          "Transmission received. Your note is now in the Logic Vault operations flow."
      );
      setStatus({
        tone: "success",
        message:
          payload.message ??
          "Transmission received. Your note is now in the Logic Vault operations flow.",
      });
      setFormValues({
        name: "",
        email: "",
        company: "",
        purpose: PURPOSE_OPTIONS[0],
        message: "",
        website: "",
        captchaAnswer: "",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not send your note. Please try again in a moment.",
      });
    } finally {
      setIsSending(false);
      void loadChallenge();
    }
  };

  return (
    <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="lv-surface rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Contact Logic Vault
            </p>
            <h2 className="lv-text-primary mt-2 text-2xl font-black tracking-[-0.04em]">
              Tell us what you need
            </h2>
          </div>
          <div className="lv-header-control rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            ops@logicvault.org
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="lv-text-secondary block text-sm font-semibold">Name</span>
              <input
                className={baseInputClassName}
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Jane Doe"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="lv-text-secondary block text-sm font-semibold">Email</span>
              <input
                type="email"
                className={baseInputClassName}
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="jane@company.com"
                required
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="lv-text-secondary block text-sm font-semibold">
                Company or team
              </span>
              <input
                className={baseInputClassName}
                value={formValues.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="Logic Vault Partner"
              />
            </label>

            <label className="space-y-2">
              <span className="lv-text-secondary block text-sm font-semibold">Purpose</span>
              <select
                className={baseInputClassName}
                value={formValues.purpose}
                onChange={(event) => updateField("purpose", event.target.value)}
              >
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="hidden">
            <span>Website</span>
            <input
              tabIndex={-1}
              autoComplete="off"
              value={formValues.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
          </label>

          <div className="lv-surface-inset rounded-[24px] p-4">
            <div className="flex items-start gap-3">
              <span className="lv-neon-icon-shell lv-neon-cobalt inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-vault-electric shadow-sm">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                  Security Challenge
                </p>
                <label className="mt-3 block space-y-2">
                  <span className="lv-text-primary block text-sm font-semibold">
                    {challenge
                      ? `Human Verification: What is ${challenge.left} + ${challenge.right}?`
                      : "Human Verification: Loading challenge..."}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className={baseInputClassName}
                    value={formValues.captchaAnswer}
                    onChange={(event) => updateField("captchaAnswer", event.target.value)}
                    placeholder="Enter the sum"
                    disabled={isLoadingChallenge}
                  />
                </label>
                <p className="lv-text-muted mt-3 text-sm">
                  {isLoadingChallenge
                    ? "Loading verification..."
                    : isHumanVerified
                      ? "Verified. You can send your message now."
                      : "Enter the correct answer to activate the send button."}
                </p>
              </div>
            </div>
          </div>

          <label className="space-y-2">
            <span className="lv-text-secondary block text-sm font-semibold">Message</span>
            <textarea
              className={`${baseInputClassName} min-h-40 resize-y`}
              value={formValues.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Tell us about your project, timeline, or the kind of placement you want."
              required
            />
          </label>

          {status ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.tone === "success"
                  ? "lv-note-success"
                  : "lv-note-info"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="lv-text-muted text-sm">
              For partnerships and ad placement, include audience, timing, and your preferred
              region.
            </p>
            <button
              type="submit"
              disabled={isSending || isLoadingChallenge || !isHumanVerified}
              className="lv-button-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </section>

      <section className="lv-surface rounded-[28px] p-5 sm:p-6">
        <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
          Best fit
        </p>
        <div className="mt-4 space-y-4">
          <div className="lv-surface-inset rounded-2xl p-4">
            <p className="lv-text-primary text-sm font-bold">Partnerships</p>
            <p className="lv-text-secondary mt-2 text-sm leading-7">
              Tell us what you want to build together, which markets matter, and what success
              looks like.
            </p>
          </div>
          <div className="lv-surface-inset rounded-2xl p-4">
            <p className="lv-text-primary text-sm font-bold">Ad placement</p>
            <p className="lv-text-secondary mt-2 text-sm leading-7">
              Share your preferred placement, creative format, target region, and campaign dates.
            </p>
          </div>
          <div className="lv-surface-inset rounded-2xl p-4">
            <p className="lv-text-primary text-sm font-bold">Support</p>
            <p className="lv-text-secondary mt-2 text-sm leading-7">
              Include the exact tool name, a sample file type, and the issue you want us to help
              with.
            </p>
          </div>
        </div>
      </section>

      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-6 right-4 z-50 max-w-sm sm:right-6">
          <div className="lv-toast-shell overflow-hidden rounded-[24px] px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="lv-toast-icon inline-flex size-11 shrink-0 items-center justify-center rounded-2xl">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="lv-toast-eyebrow text-sm font-semibold uppercase tracking-[0.24em]">
                  Transmission Received
                </p>
                <p className="lv-toast-copy mt-2 text-sm leading-7">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
