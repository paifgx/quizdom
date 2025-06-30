### Branch-Strategie

- **main**
  - Immer deploy-fähig.
  - Jede Merge löst CD auf _Staging_ → Smoke-Test.

- **feature/\<issue-ID>-\<kurztitel>**
  - Ausgangspunkt = main.
  - Nur eine Person pro Branch.
  - PR so klein wie möglich (≤ 400 Zeilen diff).
  - Squash-Merge mit _Conventional Commits_-Prefix (feat:, fix:, chore: …).
  - Automatische Checks: Lint, Test, Build.

- **hotfix/\<kurzbeschreibung>**
  - Nur wenn Prod-Bug.
  - Branch direkt von main.
  - Merge → Tag vX.Y.Z → Prod-Deploy.

- **Release-Tags**
  - Version nach _CalVer_ (YYYY.MM.Patch).
  - Tag setzt GitHub Action „create-release“.

- **Arbeits­ablauf**
  1. Issue in Jira → feature-Branch.
  2. Push → CI läuft.
  3. PR → Review durch mindestens 1 Team-Kollege.
  4. Merge (Squash) → main → CD Staging.
  5. Release-Tag → Prod.

- **Regeln**
  - Keine dauerhaften _develop_, _release_ Branches.
  - Feature-Branch lebt max. 6 Tage.
  - Rebase vor PR, keine Merge-Commits.
  - Code-Owner-Review Pflicht für Architektur- oder Security-Änderungen.

- **Tooling**
  - GitHub branch protection:
    - 1 Review
    - Green CI
    - Linear history

  - commitlint + husky sichern das Prefix.
