# Security Specification for MahaNaukri Update Jobs Collection

## 1. Data Invariants
1. Only authenticated administrators may create, update, or delete job documents in `/jobs/{jobId}`.
2. Public (unauthenticated) users can ONLY read/list jobs where `resource.data.status == 'published'`. Unauthenticated users can never read draft or archived jobs.
3. Every job document must have non-empty `title`, `department`, `category`, `postName`, and a valid `status` ('published', 'draft', or 'archived').
4. Document ID `{jobId}` must be valid alphanumeric/hyphen/underscore with size <= 128 (`isValidId(jobId)`).
5. All string fields must adhere to strict size bounds preventing resource exhaustion.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Public Create**: An unauthenticated user attempts to create a recruitment job document. -> PERMISSION_DENIED.
2. **Unauthenticated Public Update**: An unauthenticated user attempts to edit a recruitment job. -> PERMISSION_DENIED.
3. **Unauthenticated Public Delete**: An unauthenticated user attempts to delete a recruitment job. -> PERMISSION_DENIED.
4. **Unauthenticated Public Read of Draft Job**: An unauthenticated visitor tries to `get` `/jobs/{jobId}` where `status == 'draft'`. -> PERMISSION_DENIED.
5. **Unauthenticated Public List of Draft Jobs**: An unauthenticated visitor tries to list jobs where `status != 'published'`. -> PERMISSION_DENIED.
6. **ID Injection Poisoning**: An attacker tries to write to a path with a 2KB junk character ID `/jobs/{long_bad_id}`. -> PERMISSION_DENIED.
7. **Missing Required Fields**: An authenticated write missing required fields `title` or `category`. -> PERMISSION_DENIED.
8. **Invalid Status Transition**: An authenticated write with status set to `malicious_status`. -> PERMISSION_DENIED.
9. **Denial of Wallet Huge Payload**: An authenticated write with a 2MB string in `title`. -> PERMISSION_DENIED.
10. **Type Mismatch on Boolean**: A write with `hallTicketReleased` set to `"true"` (string instead of boolean). -> PERMISSION_DENIED.
11. **Type Mismatch on Vacancies**: A write with `vacancies` set to negative or string. -> PERMISSION_DENIED.
12. **Catch-All Default Deny**: Any write or read to undeclared collections (e.g., `/admin_secrets/{id}`). -> PERMISSION_DENIED.

## 3. Test Runner
Verified with Firestore rules test harness ensuring every unauthenticated mutation or invalid payload is rejected with PERMISSION_DENIED.
