# End-to-end acceptance contracts

## IT-001 Ledger → Budget → Reports

Given CAD checking 10,000, groceries CAD 300, transfer CAD 2,000 to savings, refund CAD 30, card payment CAD 100; expect net expense CAD 270 for groceries, transfers not double expenses, ledger balanced, net worth movement reconciled.

## IT-002 Goal funding without double assets

Given liquid CAD 5,000, two active goals with CAD 3,000 and CAD 2,000 earmarked; no change to actual account balance. Additional CAD 1 rejected. Releasing CAD 500 frees reservation with event history.

## IT-003 Three active top-level goals

Activate 3; attempt activate 4th in same workspace; expect stable domain error with no partially committed state; subcomponent doesn't count. Pausing one permits new Active after user consent.

## IT-004 Finance shock & proposal

C=2000/month => car 1000, trip 200, retirement 800. Set scenario C=1000 => proposal car 1000/trip 0/retire 0; underlying journal and accepted prior funding plan unchanged until explicit confirmation.

## IT-005 Two users, disjoint workspaces

User A can only read A's balances and goals. Guessing B's UUID cannot read or write; attempted imported record cross-workspace rejected; no resource existence details leaked.

## IT-006 Import/export round-trip

Export synthetic dataset including account, transaction, budget, goal allocations. Validate and import to clean test workspace, compare transaction counts/merkle-like digest or canonical snapshot totals. Reject incorrect schema version and duplicate entries.

## IT-007 Retirement activation

Future retirement budget preview differs from active spending. Confirm event starts new version on effective date; old expenses, reports and budget remain queryable. Other goals not deleted.

## IT-008 Multi-currency reporting

JPY and CAD holdings cannot be summed as native values. With dated FX, converted summary includes rate provenance and FX-change component; missing FX yields incomplete flag.
