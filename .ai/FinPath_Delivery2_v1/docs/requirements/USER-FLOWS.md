# User flows & interaction acceptance

All flows must use synthetic data in tests. Every scenario states preconditions, action, success, and failure.

## UF-01: first use
- Precondition: new authenticated/test identity, no profile.
- Show 3 concise screens: money manager scope, current needs, optional future goal. All can skip.
- If goals not selected, do not force creation; show Home with example help only.
- Show three feature visibility groups: enabled, recommended, discoverable. Disabling a feature keeps its data.
- Negative: reload mid-journey retains partial state; one optional response cannot silently grant permissions.

## UF-02: add income/expense
- Choose account, amount, category, date and optional memo. Validate currency, ownership, money scale.
- Server creates balanced postings and returns transactionId; account balance and period report reconcile.
- Duplicate submissions with the same idempotency key do not double post; invalid account rejected.

## UF-03: transfer and correction
- Transfer CAD 200 from checking to savings: two asset-side movements, no consumption/income gain.
- Reverse mistaken transaction rather than silently deleting. Both source and reversal discoverable.
- Prevent negative permitted available balance if account policy disallows overdraft.

## UF-04: budget
- Set monthly food budget CAD 700; record CAD 720 actual expenses; report +CAD 20 over budget.
- Refund CAD 50 adjusts net actual according to documented period rule, not total transfer.
- Budget versions are immutable once superseded, older months retain original plan.

## UF-05: goal creation
- Create simple car goal CAD 12,000 due in 12 months, reserved 0: basic needed = CAD 1,000/month ignoring interest.
- Create wedding composite goal with optional ceremony/gift/honeymoon components; independent home goal cannot double allocate the same cash.
- Goal may remain queued without consuming active slot. Fourth simultaneous top-level active goal fails atomically.

## UF-06: goal pool allocation
- Account liquid available CAD 5,000, reserve car CAD 3,000 and trip CAD 2,000. Account balance remains CAD 5,000.
- Attempt to reserve additional CAD 1 fails; no hidden ability to borrow an existing reservation.
- Reassign from trip to car only after explicit confirmation; event preserved in history.

## UF-07: income shock / plan proposal
- Safe allocatable cash falls CAD 2,000 -> CAD 1,000/month. Preview alternate proposal and affected goal ETAs.
- Proposal does not change Active/Pause/standing allocations until user clicks Confirm.
- Repeated tiny monthly changes should not repeatedly toggle goals without policy thresholds.

## UF-08: car, wedding, child and retirement phase
- Finish car purchase -> optional recurring insurance/maintenance budget is suggested, not auto-committed.
- Retirement event -> show retirement budget categories and expected income; activation versioned, prior history retained.
- Child age-stage -> adjust only future assumptions, not historic transaction categories.

## UF-09: multi-currency
- Record CAD and CNY separately with native units; reporting in CAD requires date-specific FX data.
- FX estimate not equal to trade execution rate, and neither equals investment return.
- Without an FX rate do not silently report a mixed-currency sum.

## UF-10: data export/import
- CSV rows previewed and mapped before import; duplicate detection; full JSON backup has schema version.
- Roundtrip account/transaction/goal totals match; unknown schema version rejected with explanatory message.

## UF-11: authorization
- A user in workspace A requests B's transaction/account/goal by ID: 403 or generic 404, no data leakage.
- Disabling a UI module must not revoke required backend access incorrectly; permission policy independent from navigation.
