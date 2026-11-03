import type { JSX, ReactNode } from "react";
import Heading from "@theme/Heading";
import clsx from "clsx";

import styles from "./styles.module.css";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, JSX.Element> = {
  layers: (
    <Svg>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    </Svg>
  ),
  shield: (
    <Svg>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Svg>
  ),
  terminal: (
    <Svg>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </Svg>
  ),
  rocket: (
    <Svg>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Svg>
  ),
  anchor: (
    <Svg>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 22V8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </Svg>
  ),
  flask: (
    <Svg>
      <path d="M10 2v7.31" />
      <path d="M14 9.3V2" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      <path d="M5.58 16.5h12.85" />
    </Svg>
  ),
};

const FeatureList: {
  title: string;
  icon: keyof typeof ICONS;
  description: JSX.Element;
}[] = [
  {
    title: "Workspace compatible",
    icon: "layers",
    description: (
      <>
        Drop Readma at the root of a Deno, pnpm/npm or Cargo workspace: every
        member gets its own README, and the root gets a package table linking
        to all of them.
      </>
    ),
  },
  {
    title: "Automatic shields",
    icon: "shield",
    description: (
      <>
        Version, codecov, stars, forks, issues, pull requests, last commit,
        release, license… 14 built-in badges with sane links, each one
        disableable and extensible with your own.
      </>
    ),
  },
  {
    title: "CLI toolkit",
    icon: "terminal",
    description: (
      <>
        <code>init</code> scaffolds a config from your git remote, language and
        license, <code>gen</code> renders the readmes, <code>validate</code>{" "}
        lints the config, <code>schema</code> powers editor autocompletion.
      </>
    ),
  },
  {
    title: "CI friendly",
    icon: "rocket",
    description: (
      <>
        <code>gen --check</code> exits with code 2 when a README is out of sync
        with the config, and <code>--offline</code> skips every network call.
        Drop both in your pipeline and forget about stale docs.
      </>
    ),
  },
  {
    title: "GitHub compatible anchors",
    icon: "anchor",
    description: (
      <>
        The generated table of contents uses the exact same anchor algorithm as
        GitHub — emojis included — so every in-page link works in the rendered
        README and in editors.
      </>
    ),
  },
  {
    title: "Quality gate",
    icon: "flask",
    description: (
      <>
        100% test coverage across lines, branches and functions,{" "}
        <code>deno lint</code> plus <code>oxlint</code> in pedantic mode with
        zero suppressions. Built to be relied upon.
      </>
    ),
  },
];

function Feature({
  title,
  icon,
  description,
}: {
  title: string;
  icon: keyof typeof ICONS;
  description: JSX.Element;
}) {
  return (
    <div className={clsx("col col--4", styles.featureCol)}>
      <div className="feature-card">
        <div className="feature-icon">{ICONS[icon]}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="section">
      <div className="container">
        <Heading as="h2" className="section-title">
          Everything a good README needs, generated
        </Heading>
        <p className="section-subtitle">
          Readma parses the project files you already maintain —{" "}
          <code>deno.json</code>, <code>package.json</code>,{" "}
          <code>Cargo.toml</code>, <code>pnpm-workspace.yaml</code> — and turns
          them into a standardized, badge-complete README with your content in
          the sections that matter.
        </p>
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
