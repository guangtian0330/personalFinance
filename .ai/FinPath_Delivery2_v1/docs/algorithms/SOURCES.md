# Research and source register (as of 2026-10-27)

## Published methodology

1. UK Government, MCDA Manual: https://www.gov.uk/government/publications/multi-criteria-analysis-manual-for-making-government-policy — supports explicit multi-criteria scoring / weight sensitivity, not preset personal weights.
2. Saaty, analytic hierarchy process: https://doi.org/10.1287/mnsc.32.7.841 — preference elicitation, optional advanced method.
3. Das, Ostrov, Radhakrishnan & Srivastav, *Dynamic optimization for multi-goals wealth management*, Journal of Banking & Finance 140 (2022): https://doi.org/10.1016/j.jbankfin.2021.106192 — multiple competing goals, dynamic programming; advanced future method, not simple MVP implementation.
4. Capponi & Zhang, *A Continuous Time Framework for Sequential Goal-Based Wealth Management*, Management Science 70 (2024): https://doi.org/10.1287/mnsc.2022.02047 — optimal multi-goal investment and expiring goal trade-offs; mathematically more complex than MVP.
5. Financial Consumer Agency of Canada — setting savings and investment goals: https://www.canada.ca/en/financial-consumer-agency/services/savings-investments/savings-investment-goals.html — time horizon/goal planning general principles.

## Framework and open source

- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare D1: https://developers.cloudflare.com/d1/platform/limits/
- Codex long-term repo guidance: https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- OpenAI harness engineering lessons: https://openai.com/index/harness-engineering/
- Hono: https://hono.dev/
- Drizzle ORM: https://orm.drizzle.team/
- Zod: https://zod.dev/
- decimal.js: https://github.com/MikeMcl/decimal.js (verify license/version before adoption)
- HiGHS: https://github.com/ERGO-Code/HiGHS (MIT core; optional components may alter obligations)
- glpk.js: https://github.com/jvail/glpk.js (GPL-3.0 licensing: NOT selected by default)
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/

## Governance

Every dependency selected by Codex must have package name, version, upstream, license, security review and rationale at adoption time. A research citation is not a product calibration or guarantee. Verify current hosting limits, API compatibility and licenses at implementation, as these may change.
