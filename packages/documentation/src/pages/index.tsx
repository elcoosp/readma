import type { JSX } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HowItWorks from "@site/src/components/HowItWorks";
import PackageCards from "@site/src/components/PackageCards";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import { useCallback, useState } from "react";

import styles from "./index.module.css";

const INSTALL_CMD = "deno run -A jsr:@readma/cli init";

function HeroInstall() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(INSTALL_CMD).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => undefined,
    );
  }, []);
  return (
    <button type="button" className={styles.heroInstall} onClick={copy} aria-label="Copy the install command">
      <span className="prompt">$</span>
      <span className={styles.heroInstallCmd}>{INSTALL_CMD}</span>
      <span className={styles.heroInstallHint} aria-live="polite">
        {copied ? "copied ✓" : "click to copy"}
      </span>
    </button>
  );
}

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="hero-banner">
      <div className="container text--center">
        <img
          src="/img/logo.png"
          alt="Readma logo"
          className="hero-logo"
          width={132}
          height={132}
        />
        <Heading as="h1" className="hero-title">
          {siteConfig.title}
        </Heading>
        <p className="hero-subtitle">{siteConfig.tagline}</p>
        <p className="hero-tagline">
          Automatically generates comprehensive, well-structured README files
          from the project files you already maintain — workspace tables,
          shields.io badges, table of contents and GitHub anchors included.
          One command, every readme, CI-safe.
        </p>
        <div className="hero-buttons">
          <Link className="button button--lg button--coral" to="/docs/intro">
            Get started →
          </Link>
          <Link
            className="button button--lg button--ghost"
            to="/docs/cli/overview"
          >
            CLI reference
          </Link>
          <a
            className="button button--lg button--ghost"
            href="https://github.com/elcoosp/readma"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⭐ GitHub
          </a>
        </div>
        <HeroInstall />
        <div className="hero-trust">
          <span>🦕 Deno 2+</span>
          <span>🟦 TypeScript</span>
          <span>📄 MIT</span>
          <span>✅ 100% coverage</span>
          <span>🦀 &amp; Rust crates</span>
        </div>
      </div>
    </header>
  );
}

function Demo() {
  return (
    <section className="section">
      <div className="container">
        <Heading as="h2" className="section-title">
          See it in action
        </Heading>
        <p className="section-subtitle">
          Generate the whole workspace in a single run — root readme with the
          package table, plus one readme per member with its own badges and
          installation snippet.
        </p>
        <div className="row">
          <div className="col col--6 col--offset-0">
            <div className="terminal-window">
              <div className="terminal-bar">
                <span className="terminal-dot" style={{ background: "#ff5f57" }} />
                <span className="terminal-dot" style={{ background: "#febc2e" }} />
                <span className="terminal-dot" style={{ background: "#28c840" }} />
                <span className="terminal-title">zsh — readma</span>
              </div>
              <div className="terminal-body">
                <div><span className="t-dim">$</span> <span className="t-cmd">deno run -A jsr:@readma/cli gen</span></div>
                <div className="t-dim">Starting readma generation</div>
                <div>Rendering <span className="t-coral">&quot;workspace root&quot;</span> readme</div>
                <div>Rendering <span className="t-coral">&quot;@readma/core&quot;</span> readme</div>
                <div>Rendering <span className="t-coral">&quot;@readma/cli&quot;</span> readme</div>
                <div>Rendering <span className="t-coral">&quot;@readma/pkg-json&quot;</span> readme</div>
                <div className="t-green">✓ 4 readmes written</div>
                <div>&nbsp;</div>
                <div><span className="t-dim">$</span> <span className="t-cmd">git status --short</span></div>
                <div><span className="t-coral">M</span> README.md</div>
                <div><span className="t-coral">M</span> packages/core/README.md</div>
                <div><span className="t-coral">M</span> packages/cli/README.md</div>
                <div><span className="t-coral">M</span> packages/pkg-json/README.md</div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className="screenshot-frame">
              <img
                src="/img/screenshot.gif"
                alt="Readma generating readme files in a terminal"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <h2>Ship a README that rocks</h2>
          <p>Scaffold, customize, generate — and never hand-write a badge again.</p>
          <div className="hero-buttons">
            <Link className="button button--lg button--coral" to="/docs/intro">
              Read the quick start
            </Link>
            <Link
              className="button button--lg button--ghost"
              to="/docs/config/overview"
            >
              Configuration reference
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — ${siteConfig.tagline}`}
      description="Readma generates complete, well-structured README files for Deno, pnpm/npm and Cargo workspaces: automatic shields, table of contents, workspace tables and a CI check mode."
    >
      <Hero />
      <main>
        <Demo />
        <HomepageFeatures />
        <HowItWorks />
        <PackageCards />
        <CtaBand />
      </main>
    </Layout>
  );
}
