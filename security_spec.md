# Security Specification — SiamVolt Transformer Firestore

## 1. Data Invariants
1. **Public Catalog Integrity**: `lots` and `transformers` contain zero PII and are publicly readable (`get`, `list`), but mutations (`create`, `update`, `delete`) are strictly restricted to verified administrators (`isAdmin()`).
2. **Relational Integrity**: Every `TransformerUnit` in `/transformers/{transformerId}` must reference an existing lot in `/lots/{lotId}` via `exists(...)` on creation.
3. **Owner-Only PII Isolation**: `quoteRequests` and `visitBookings` contain buyer contact details (`contactName`, `phone`, `lineOrEmail`, `visitorPhone`). Reads (`get`, `list`) are strictly restricted to the document creator (`resource.data.userId == request.auth.uid`) or a verified admin (`isAdmin()`).
4. **Subcollection Master Gate**: `/quoteRequests/{requestId}/items/{itemId}` strictly inherits access from parent `/quoteRequests/{requestId}` via `get(...)`.
5. **Terminal State Locking**: Once a `QuoteRequest` reaches `status == 'closed'` or a `VisitBooking` reaches `status == 'completed'` or `'cancelled'`, non-admin updates are blocked.
6. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` is immutable on update and `updatedAt == request.time`.
7. **Strict Key & Size Enforcement**: Every `create` checks `hasAll` and `hasOnly`; every `update` checks `affectedKeys().hasOnly(...)` and runs `isValid[Entity]`; every string enforces `.size()` bounds; every document ID enforces `isValidId()`.

## 2. The "Dirty Dozen" Attack Payloads (All Expected: PERMISSION_DENIED)
1. **Unauthenticated Catalog Write**: Anonymous user attempts `setDoc(/lots/lot-fake, ...)` -> Denied (`!isAdmin()`).
2. **Non-Admin Transformer Create**: Authenticated regular buyer attempts `setDoc(/transformers/tr-fake, ...)` -> Denied (`!isAdmin()`).
3. **Unverified Admin Email Spoof**: User with admin email but `email_verified: false` attempts write to `/lots/lot-a` -> Denied (`email_verified == true` check fails).
4. **Orphaned Transformer Create**: Admin attempts to create `/transformers/tr-orphan` with non-existent `lotId: "missing-lot"` -> Denied (`exists(/lots/missing-lot)` fails).
5. **Shadow Field Injection on QuoteRequest**: Verified buyer creates `/quoteRequests/q1` with extra field `isApproved: true` -> Denied (`hasOnly` rejects).
6. **Identity Spoofing on QuoteRequest**: Verified buyer A creates `/quoteRequests/q2` with `userId: "buyer-B"` -> Denied (`incoming().userId == request.auth.uid` fails).
7. **Client Timestamp Forgery**: Verified buyer creates `/quoteRequests/q3` with backdated `createdAt` -> Denied (`incoming().createdAt == request.time` fails).
8. **Cross-User PII Read (`get`)**: Verified buyer A reads `/quoteRequests/q-of-buyer-B` -> Denied (`resource.data.userId == request.auth.uid` fails).
9. **Blanket List Scraping (`list`)**: Verified buyer A runs unfiltered `getDocs(collection(db, 'quoteRequests'))` -> Denied (`allow list` enforces `resource.data.userId == request.auth.uid`).
10. **Status Escalation by Buyer**: Verified buyer A updates their own quote request to `status: "quoted"` -> Denied (buyers cannot transition status to quoted/closed; only `isAdmin()` or cancelling own pending request).
11. **ID Poisoning**: Verified buyer creates `/quoteRequests/${'a'.repeat(500)}` -> Denied (`isValidId()` rejects >128 chars).
12. **Self-Assigned Admin**: Verified buyer writes `/admins/${uid}` to escalate privilege -> Denied (only existing/bootstrapped admin can manage `/admins`).
