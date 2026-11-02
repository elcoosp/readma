#!/bin/bash

# Script de commit automatique et conventionnel - Un commit par fichier
# Compatible Bash 3.2 (macOS) - Garanti sans structure moderne complexe

# Liste des fichiers modifiés (staged ou unstaged)
files=$(git status --porcelain | awk '{print $2}')

if [ -z "$files" ]; then
    echo "Aucun fichier modifié détecté dans le dépôt Git."
    exit 0
fi

for file in $files; do
    # Vérification de l'existence du fichier (pour ignorer les fichiers supprimés)
    if [ ! -f "$file" ]; then
        continue
    fi

    echo "Analyse et commit pour : $file"

    # Assignation du message selon le fichier exact du diff
    case "$file" in
        ".github/dependabot.yml")
            subject="ci(dependabot): add automated dependency updates configuration"
            body="Introduce Dependabot configuration to automate weekly security and version updates.
- Configured ecosystem tracking for Cargo dependencies (minor and patch updates grouped).
- Configured ecosystem tracking for GitHub Actions updates."
            ;;
        ".github/workflows/ci.yml")
            subject="ci(workflows): implement comprehensive GitHub Actions validation pipeline"
            body="Create a unified CI workflow to enforce codebase quality gates on push/PR.
- Add Cargo formatting verification step.
- Add pedantic, nursery, and documentation linting via Clippy with warnings treated as errors.
- Enforce Minimum Supported Rust Version (MSRV 1.85.0) verification check.
- Set up a multi-OS testing matrix (Ubuntu, macOS, Windows).
- Integrate line coverage benchmarking utilizing cargo-llvm-cov with a strict 100% threshold.
- Introduce automated security auditing with cargo-audit."
            ;;
        ".github/workflows/release.yml")
            subject="ci(workflows): add automated deployment and multi-platform release pipeline"
            body="Introduce a production-grade release pipeline triggered exclusively on version tags.
- Generate automated changelogs with git-cliff-action utilizing cliff.toml specifications.
- Compile and pack cross-platform binary targets for x86_64/aarch64 Linux, macOS, and Windows.
- Automate secure GitHub Release asset embedding and conditionally publish crates to crates.io."
            ;;
        "CHANGELOG.md")
            subject="docs(changelog): initialize changelog structure for v0.1.0 and v0.2.0"
            body="Create the Keep a Changelog compliant ledger documenting historical iterations.
- Backport logs detailing the v0.1.0 clap validation baseline.
- Formalize v0.2.0 API overhauls, binary compilation workflows, and licensing additions."
            ;;
        "Cargo.lock")
            subject="chore(deps): synchronize lockfile for workspace dependency overhaul"
            body="Re-lock all direct and deep dependencies following the removal of async/network runtimes.
- Remove redundant anyhow, tokio, hyper, reqwest, ollama-rs, and unicode processing packages.
- Align lock versions with native rspolib structural components and upgraded clap structures."
            ;;
        "Cargo.toml")
            subject="refactor(manifest): prune asynchronous/network dependencies and elevate to v0.2.0"
            body="Update crate configuration manifest to reflect a lean, sync library-first paradigm.
- Bump version to 0.2.0 and introduce Rust edition and MSRV constraints.
- Strip heavy anyhow, reqwest, tokio, ollama-rs, and url dependencies.
- Add thiserror and tempfile for typed errors and local unit validation respectively.
- Inject workspace-wide default strict lints targeting clippy, nursery, and missing docs."
            ;;
        "LICENSE")
            subject="docs(legal): add project license under the MIT terms"
            body="Incorporate standard MIT licensing protections to support open source distribution.
- Set authorship identity and assign protection boundaries starting from 2026."
            ;;
        "README.md")
            subject="docs(readme): rewrite documentation for sync engine architecture and json outputs"
            body="Overhaul the technical readme document to fully depict the tool capabilities.
- Detail workflow semantics governing entry lookup matching by context, id, and plural boundaries.
- Add executable shell flag matrices, clear exit code standards, and concrete library integration usage snippets.
- Add machine-readable single-line JSON structure visualization documentation."
            ;;
        "cliff.toml")
            subject="chore(release): configure conventional commit rules for git-cliff changelogs"
            body="Introduce a tailored formatting configuration for git-cliff.
- Map scopes such as feat, fix, perf, refactor, and doc to discrete document groups.
- Set ignore filters against minor dependency bumps, release chores, and irregular PR logs."
            ;;
        "src/cli.rs")
            subject="feat(cli): design explicit declarative command line flag interface"
            body="Construct clean, self-contained sub-structures managing runtime options using clap.
- Wire type-safe subcommands driving independent gen, init, validate, and schema flows.
- Group variables decoupling output presentation controls from background engine operations.
- Build transparent conversion abstractions mapping raw CLI parameters directly into type-safe business rules.
- Author unit tests validating defaults, combined flags, and unknown flag rejections."
            ;;
        "src/error.rs")
            subject="feat(error): introduce strictly-typed library error enum wrappers"
            body="Craft a robust, domain-driven Error structure powered by thiserror macros.
- Avoid loose context strings by capturing precise PathBuf environments inside distinct variants.
- Isolate parsing syntax exceptions, I/O writes, non-UTF8 directory issues, and missing gate counts.
- Add strict formatting output assertions across every custom enum branch."
            ;;
        "src/lib.rs")
            subject="refactor(core): structural library definition entry point stabilization"
            body="Reorganize the internal module landscape to expose a clean, public programmatic interface.
- Expose essential outcome definitions, baseline option structures, and procedural execution runs.
- Add embedded compile-checked documentation integration examples."
            ;;
        "src/main.rs")
            subject="refactor(main): isolate cli command dispatcher execution from sync engines"
            body="Purge legacy async Ollama network orchestration logic to establish a clean CLI layer.
- Shift heavy processing blocks out of main into discrete operational core structures.
- Map global processing results cleanly into formatted human summaries or structured compact JSON outputs.
- Enforce platform-native ExitCode conversions aligning strictly with the documented runtime contract."
            ;;
        "src/po.rs")
            subject="feat(po): craft safe translation semantics and entry evaluation engines"
            body="Implement deterministic wrapper evaluation utilities operating over basic rspolib elements.
- Isolate criteria establishing missing criteria (whitespace checks, incomplete plural lists, or fuzzy states).
- Establish multi-variant context index mapping hashes ensuring instant identity tracking on deep lookups.
- Clear fuzzy flags automatically on entry merge loops to signoff translated work."
            ;;
        "src/process.rs")
            subject="feat(engine): code a parallel multi-locale translation sync scheduler"
            body="Build the central localization lifecycle orchestration algorithm.
- Scan locale layers to resolve main and missing files, applying safe non-destructive in-memory merge sequences.
- Utilize thread-scoped parallelism via thread::scope to execute concurrent operations without performance overhead.
- Ensure safety constraints aborting files when structural parse limits are breached."
            ;;
        "src/process/tests.rs")
            subject="test(engine): implement deep system-level integration test cases"
            body="Construct an isolated local processing verification suite inside temp directories.
- Map directory locale discovery exclusions handling hidden paths and empty trees.
- Validate full/partial merge behaviors, fuzzy processing paths, and header metadata carries.
- Guard translator modifications by confirming broken file isolation states.
- Inject Unix-specific file permission mask overrides enforcing raw I/O write failures."
            ;;
        "tests/cli.rs")
            subject="test(cli): deploy end-to-end binary execution blackbox test coverage"
            body="Build real-world functional integration verification blocks driving the built binary.
- Assess exit code contract parameters under standard executions and failure environments.
- Validate machine-readable compact JSON print outputs and verbose shell reporting lines.
- Affirm processing behavior parity when utilizing multi-threaded worker configurations."
            ;;
        *)
            # Fallback pour tout autre fichier non répertorié explicitement
            subject="chore: update $(basename "$file")"
            body="Refactor or clean up internal logic structures within $file."
            ;;
    esac

    # Indexation temporaire, commit et nettoyage progressif
    git add "$file"
    git commit -m "$subject" -m "$body"

    echo "✅ Commité avec succès : $file"
    echo "--------------------------------------------"
done

echo "Tous les fichiers de ce dépôt ont été enregistrés individuellement."
