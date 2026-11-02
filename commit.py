import os
import subprocess
import sys

msg = {
    "readma.config.ts": (
        "refactor(config): update features and guidelines",
        "Update configurations.",
    ),
    "packages/cli/deno.json": (
        "refactor(cli): update deps to v0.7.0",
        "Upgrade manifest dependencies.",
    ),
    "packages/cli/src/cli.ts": (
        "feat(cli): rewrite command multiplexer",
        "Refactor CLI subcommands.",
    ),
    "packages/cli/src/config.ts": (
        "feat(config): implement config loaders",
        "Add validation layers.",
    ),
    "packages/cli/src/detect.ts": (
        "feat(detect): build workspace scanner",
        "Add workspace automatic detection.",
    ),
    "packages/cli/src/gen.ts": (
        "feat(gen): implement readme compiler",
        "Add async document compilation loops.",
    ),
    "packages/cli/src/init.ts": (
        "feat(init): write project scaffolding",
        "Add automatic git remote parsing.",
    ),
    "packages/cli/src/logger.ts": (
        "feat(logger): introduce log reporter",
        "Add priority switch management.",
    ),
    "packages/cli/src/schema.ts": (
        "feat(schema): export declarative json schema",
        "Add IDE editor completion mapping.",
    ),
    "packages/cli/src/validate.ts": (
        "feat(validate): design file health inspector",
        "Verify logo and template presence.",
    ),
    "packages/cli/tests/gen.test.ts": (
        "test(cli): implement integration validation",
        "Add CLI blackbox execution coverage.",
    ),
    "packages/cli/tests/modules.test.ts": (
        "test(cli): add unit tests for modules",
        "Assert core utility isolated variables.",
    ),
    "packages/core/deno.json": (
        "refactor(core): streamline import map to v0.7.0",
        "Prune unused vendor dependencies.",
    ),
    "packages/core/src/context.ts": (
        "feat(core): decouple async environment resolution",
        "Isolate branch and license logic.",
    ),
    "packages/core/src/io.ts": (
        "feat(core): design abstract input output bridge",
        "Encapsulate file text system tools.",
    ),
    "packages/core/src/mdx-manager.ts": (
        "feat(core): stabilize mdx compilation pipelines",
        "Refactor missing template operations.",
    ),
    "packages/core/src/mod.ts": (
        "refactor(core): reorganize public export api",
        "Expose badge and context systems.",
    ),
    "packages/core/src/sections.ts": (
        "feat(core): build section layout render blocks",
        "Add manual installation snippets.",
    ),
    "packages/core/src/shields.ts": (
        "feat(core): overhual dynamic shields badges",
        "Add fine grained badge tracking rules.",
    ),
    "packages/core/src/templates.ts": (
        "refactor(core): purify document rendering from disk",
        "Purify pure markdown text compilation.",
    ),
    "packages/core/src/toc.ts": (
        "feat(core): implement github anchor compiler",
        "Deduplicate heading anchor strings automatically.",
    ),
    "packages/core/src/types.ts": (
        "feat(core): declare unified type system configurations",
        "Model template layout boundaries.",
    ),
    "packages/core/src/utils.ts": (
        "feat(core): implement github anchor slugifier",
        "Add unicode character heading scrubbing.",
    ),
    "packages/core/tests/context.test.ts": (
        "test(core): add coverage for context builder",
        "Verify prefilled yml params on disk.",
    ),
    "packages/core/tests/io.test.ts": (
        "test(core): deploy unit assertions for system IO",
        "Match spdx labels from text headers.",
    ),
    "packages/core/tests/mdx-manager.test.ts": (
        "test(core): validate mdx rendering pipelines",
        "Confirm total output with html targets.",
    ),
    "packages/core/tests/sections.test.ts": (
        "test(core): verify section layout builders",
        "Assert asymmetric matrix table padding.",
    ),
    "packages/core/tests/shields.test.ts": (
        "test(core): validate shields badge layout rules",
        "Check custom shield array assignments.",
    ),
    "packages/core/tests/templates.test.ts": (
        "test(core): verify end to end template rendering",
        "Assert outputs against snapshot baselines.",
    ),
    "packages/core/tests/toc.test.ts": (
        "test(core): test table of contents deduplication",
        "Enforce numerical suffix assignment limits.",
    ),
    "packages/core/tests/utils.test.ts": (
        "test(core): add tests for formatting helpers",
        "Verify text block wraps and names.",
    ),
    "packages/documentation/docusaurus.config.ts": (
        "refactor(docs): decouple config parameters",
        "Incorporate inline layout specifications.",
    ),
    "packages/documentation/package.json": (
        "refactor(docs): optimize dependencies list",
        "Match core package versions parameters.",
    ),
    "packages/documentation/tsconfig.json": (
        "docs(tsconfig): update compilation options",
        "Embed explicit type links inside docs.",
    ),
    "packages/pkg-json/deno.json": (
        "refactor(pkg-json): simplify workspace imports map",
        "Escape package overhead on core tree.",
    ),
    "packages/pkg-json/src/mod.ts": (
        "feat(pkg-json): craft manifest reader interface",
        "Validate package object variables safely.",
    ),
    "packages/pkg-json/tests/mod.test.ts": (
        "test(pkg-json): implement unit test coverage",
        "Assert dictionary reading outputs.",
    ),
    "package.json": (
        "chore(manifest): synchronize root tool mappings",
        "Inject scripts running lint and test short-hands.",
    ),
    "pnpm-lock.yaml": (
        "chore(deps): lock down workspace tool dependencies",
        "Regenerate root dependencies trees metadata.",
    ),
    "pnpm-workspace.yaml": (
        "chore(workspace): activate cross package compilation",
        "Enable fluid build bypass task runs.",
    ),
    "scripts/pre-version.ts": (
        "refactor(version): streamline changeset release sync",
        "Map version bump logic across files.",
    ),
    "tests/repo.test.ts": (
        "test(repo): create repository dogfooding test suite",
        "Validate layout config loaders parameters.",
    ),
}


def main():
    out = subprocess.check_output(["git", "status", "--porcelain"], text=True)
    if not out.strip():
        print("Rien a commiter.")
        return
    for line in out.split("\n"):
        if not line.strip():
            continue
        file = line.strip().split(None, 1)[1].replace('"', "")
        if not os.path.isfile(file):
            continue
        s, b = msg.get(
            file, (f"chore: update {os.path.basename(file)}", "Update code logic.")
        )
        subprocess.run(["git", "add", file])
        subprocess.run(["git", "commit", "-m", s, "-m", b])
        print(f"Commit effectue pour : {file}")


if __name__ == "__main__":
    main()
