import type { JSX } from "react";
import Heading from "@theme/Heading";
import clsx from "clsx";

import styles from "./styles.module.css";

const STEPS: {
  title: string;
  description: string;
  code: string;
}[] = [
  {
    title: "Scaffold the config",
    description:
      "init detects your git remote, workspace layout, language and license, then writes a typed readma.config.ts at the root.",
    code: "deno run -A jsr:@readma/cli init",
  },
  {
    title: "Make it yours",
    description:
      "Fill the sections with your own markdown — features, installation, roadmap — and tweak badges, table of contents or badge style in one typed object.",
    code: `sections: {
  features: \`- Workspace compatible\n- Automatic shields\`,
  roadmap: \`- [x] Ship\n- [ ] Iterate\`,
}`,
  },
  {
    title: "Generate every readme",
    description:
      "One command renders the workspace root and every member readme. Re-run it any time, and let --check keep them in sync in CI.",
    code: "deno run -A jsr:@readma/cli gen",
  },
];

export default function HowItWorks(): JSX.Element {
  return (
    <section className="section">
      <div className="container">
        <Heading as="h2" className="section-title">
          Up and running in three commands
        </Heading>
        <p className="section-subtitle">
          No interactive wizard, no yaml soup: a single TypeScript file you
          already know how to edit.
        </p>
        <div className="row">
          {STEPS.map((step, index) => (
            <div key={step.title} className={clsx("col col--4", styles.stepCol)}>
              <div className="step-card">
                <span className="step-badge">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <pre className={styles.stepCode}>
                  <code>{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
