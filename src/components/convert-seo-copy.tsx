interface ConvertSeoCopyProps {
  bankName: string;
  targetLabel: string;
}

const CONVERT_HIGHLIGHTS = [
  {
    title: "Clean workflow",
    body: "A short path from upload to download keeps the task easy to finish on the first try.",
  },
  {
    title: "Private handling",
    body: "Statement work is framed around local-first processing and short-lived conversion steps.",
  },
  {
    title: "Ready-to-share output",
    body: "Downloads arrive with branded filenames so teams can recognize them quickly offline.",
  },
];

export function ConvertSeoCopy({ bankName, targetLabel }: ConvertSeoCopyProps) {
  return (
    <section className="lv-surface mx-auto mt-8 max-w-5xl rounded-[36px] p-5 sm:p-8">
      <div className="lv-surface-inset overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div>
            <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              Guided conversion
            </p>
            <h2 className="lv-text-primary mt-3 text-3xl font-black tracking-[-0.04em]">
              Convert {bankName} PDF to {targetLabel} with a clean finance-grade flow
            </h2>
            <p className="lv-text-secondary mt-4 text-sm leading-8">
              Start with a readable {bankName} account statement PDF and drop it into the upload
              zone above. Logic Vault extracts the important rows, shapes them into {targetLabel},
              and then presents a branded download button when the file is ready. The layout stays
              intentionally focused so operators can finish the job quickly without learning a full
              dashboard or jumping through setup screens.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {CONVERT_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.title}
                className="lv-surface rounded-[24px] p-5 backdrop-blur"
              >
                <p className="lv-text-primary text-sm font-bold">{highlight.title}</p>
                <p className="lv-text-muted mt-2 text-sm leading-7">{highlight.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload the statement",
              body: `Choose the ${bankName} PDF you already have on hand. The page keeps the entry point obvious so there is no guesswork.`,
            },
            {
              step: "02",
              title: `Convert into ${targetLabel}`,
              body: `Logic Vault reads the rows, keeps the flow simple, and prepares a clean export without sending you through extra screens.`,
            },
            {
              step: "03",
              title: "Download the result",
              body: "Your browser receives a branded file that is easy to save, forward, and recognize in shared folders later.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="lv-surface rounded-[24px] p-5"
            >
              <p className="lv-eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                Step {item.step}
              </p>
              <h3 className="lv-text-primary mt-3 text-lg font-black">{item.title}</h3>
              <p className="lv-text-secondary mt-3 text-sm leading-7">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="lv-surface mt-8 rounded-[28px] px-6 py-6">
          <h3 className="lv-text-primary text-xl font-black">Why teams use Logic Vault</h3>
          <p className="lv-text-secondary mt-4 text-sm leading-8">
            Each matrix page is focused on one institution and one export target, which makes the
            route easier to understand and easier to find. That clarity helps both first-time users
            and search engines: the visitor lands on the exact task they need, the page explains
            the conversion plainly, and the result feels practical instead of promotional. Privacy,
            clear progress states, and a dependable download loop stay part of the story from the
            first click to the final file.
          </p>
        </div>
      </div>
    </section>
  );
}
