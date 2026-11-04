# Open product and architecture decisions

Status: **proposed defaults**; developer/owner may explicitly approve or revise these. If a Step requires a material unresolved decision, Codex pauses rather than improvises.

| ID | Issue | Proposed default | Affects |
|---|---|---|---|
| D-01 | first delivery platform | responsive Web, Windows-native developer | deployment |
| D-02 | active goal limit | 3 top-level Active; child not counted | goals, allocation |
| D-03 | automatic pause? | recommendation/preview only, user confirms | goals, audit |
| D-04 | emergency reserves & contractual payments | hard constraint, not active slot | cash flow |
| D-05 | household collaboration | tenant-aware from day 1, multi-member P1 | DB, security |
| D-06 | currency | native ledger currencies day 1, automatic FX P1 | finance types |
| D-07 | accounting | balanced postings internal, simple UI | ledger |
| D-08 | earmarked money transfer | explicit user confirmation, no double-use | allocations |
| D-09 | onboarding | 3 optional screens + scenario prompts | UX |
| D-10 | retirement transition | event+consent; version budgets | life events |
| D-11 | optimization | transparent rule-based V1, LP/MILP P2 | algorithms |
| D-12 | authentication | local mock-only in dev, real auth pre-public | release |
| D-13 | licensing | assume potentially closed-source, audit all GPL | dependencies |
| D-14 | storage | cloud D1 initially, offline sync later | deployment |
| D-15 | returns | tracked account balance first, investment performance later | reporting |
| D-16 | UI language | English UI baseline with i18n-ready labels, Chinese translations later | UI |
| D-17 | precision | minor-unit integers with explicit FX decimal rate | domain |
| D-18 | user simulation | forecast and proposal never alter accepted plan | engine |

**Do not use a default decision to authorize public release or irreversible data migration.** User approval is a release/design gate, particularly for D-05, D-07, D-12, D-14 and D-17.
