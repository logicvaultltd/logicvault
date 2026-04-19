import type { ToolDefinition } from "@/lib/tools-registry";
import { IconByName, getAccentClasses } from "@/lib/icon-map";

interface ToolSeoCopyProps {
  tool: ToolDefinition;
}

export function ToolSeoCopy({ tool }: ToolSeoCopyProps) {
  const accent = getAccentClasses(tool.accent);
  const isDeveloperTool = tool.category === "Developer Tools";
  const startStep = tool.mode === "file"
    ? {
        title: "Choose your file",
        body: `Open ${tool.title}, add the file that matches the tool, and keep the workflow focused on the result you need.`,
      }
    : isDeveloperTool
      ? {
          title: "Paste your payload",
          body: `Open ${tool.title}, paste the JSON or text you want to inspect, and keep the workflow centered on one clean output.`,
        }
      : {
          title: "Enter your numbers",
          body: `Open ${tool.title}, fill in the required values, and let the calculator prepare a clean result from your inputs.`,
        };
  const workflowStep = tool.mode === "file"
    ? {
        title: "Confirm the details",
        body: "Add the small settings that matter, such as page ranges, statement type, or export format, without dealing with dashboard clutter.",
      }
    : isDeveloperTool
      ? {
          title: "Shape the output",
          body: "Review the editor, apply the format or generator you need, and keep the structure visible before you download the result.",
        }
      : {
          title: "Review the setup",
          body: "Check the short form, make sure the values are complete, and keep every assumption visible before the result is created.",
        };
  const resultStep = tool.mode === "file"
    ? "When the task finishes, Logic Vault prepares a branded file card with a clear download action and shows the status clearly from upload to completion."
    : isDeveloperTool
      ? "When the task finishes, Logic Vault returns a clean developer output that is easy to inspect, copy, and drop into a product workflow."
      : "When the task finishes, Logic Vault returns a practical output that is easy to read, share, and use in a finance workflow.";
  const steps = [
    startStep,
    workflowStep,
    {
      title: "Use the result",
      body: resultStep,
    },
  ];

  return (
    <section className="lv-surface mx-auto mt-8 max-w-5xl rounded-[36px] p-5 sm:p-8">
      <div className="lv-surface-inset overflow-hidden rounded-[30px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
          <div>
            <span
              role="img"
              aria-label={`Secure tool for ${tool.title} processing`}
              className={`flex size-14 items-center justify-center rounded-2xl ${accent.icon}`}
            >
              <IconByName iconName={tool.iconName} className="size-7" />
            </span>
            <p className="lv-eyebrow mt-5 text-xs font-semibold uppercase tracking-[0.28em]">
              Tool workflow
            </p>
            <h2 className="lv-text-primary mt-3 text-3xl font-black tracking-[-0.04em]">
              How to use {tool.title} without losing focus
            </h2>
            <p className="lv-text-secondary mt-4 text-sm leading-8">
              {isDeveloperTool
                ? "Logic Vault keeps developer workflows short on purpose. Every JSON tool is built around one clear job: paste the payload or add the source file, choose the output style, and review a result that is ready for production or debugging. The interface avoids bloated IDE-style chrome so the structure stays readable even when the payload is deep."
                : "Logic Vault keeps the flow short on purpose. Every tool page is built around one clear job: add the file or values, review the essentials, and get an output that is ready to use. The interface avoids hidden setup screens and heavy dashboards so first-time visitors can finish the task quickly while repeat users still get a fast professional workflow."}
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ["Status clarity", "You always see whether the task is idle, processing, or ready."],
              ["Finance-safe wording", "Errors are written plainly so teams can correct inputs fast."],
              ["Global workflow", "The same simple pattern works across PDF, AI, and financial tools."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="lv-surface rounded-[24px] p-5 backdrop-blur"
              >
              <p className="lv-text-primary text-sm font-bold">{title}</p>
              <p className="lv-text-muted mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="lv-surface rounded-[24px] p-5"
            >
              <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="lv-text-primary mt-3 text-lg font-black">{step.title}</h3>
              <p className="lv-text-secondary mt-3 text-sm leading-7">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`rounded-[28px] border px-6 py-6 ${accent.badge}`}>
            <h3 className="text-xl font-black">Built for practical output</h3>
            <p className="mt-4 text-sm leading-8">
              {isDeveloperTool
                ? `${tool.title} is designed for real payload cleanup, debugging, and interface generation without bloated setup. If the structure is invalid or the wrong format is supplied, Logic Vault responds with direct guidance instead of noisy stack traces. The result is a tool that feels quick for one-off debugging and reliable enough for repeated product work.`
                : `${tool.title} is designed for normal business files, account statements, and quick financial decisions without extra setup. If the wrong format is selected or a required value is missing, Logic Vault responds with direct guidance instead of technical noise. The result is a tool that feels simple enough for a new visitor and disciplined enough for recurring operational work.`}
            </p>
          </div>

          <div className="lv-surface rounded-[28px] px-6 py-6">
            <h3 className="lv-text-primary text-xl font-black">Why Logic Vault feels safer</h3>
            <p className="lv-text-secondary mt-4 text-sm leading-8">
              Logic Vault is framed around local-first file handling, secure downloads, and zero
              clutter between the user and the job they came to finish. The same utility-first
              pattern runs across document preparation, account statement cleanup, PDF conversion,
              finance calculators, and developer payload tools. That consistency helps people trust
              the product faster and helps search engines understand each route without thin or
              duplicated pages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
