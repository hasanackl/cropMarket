# Test Results (Week 6)

All automated results below were produced on the developer PC (Windows 11, .NET 10.0.401, SQL Server LocalDB)
on 24 November 2026. "PASS" means the test ran and its assertions held.

## 1. Summary

| Run | Tests | Result | Evidence |
|-----|-------|--------|----------|
| Service tests (TC01–TC23) | 25 | 25 passed, 11.3 s | [screenshot](../../evidence/week-06/test-run-1-service-25-passed.png) |
| Service + API + performance (TC01–TC32) | 36 | 36 passed, 21.0 s | [screenshot](../../evidence/week-06/test-run-2-all-36-passed-nfr01.png) |
| Boundary tests before the fix (TC33, TC34) | 3 | **3 failed** | [console output](../../evidence/week-06/test-run-3-boundary-before-fix.txt) |
| Boundary tests after the fix (retest) | 3 | 3 passed | [screenshot](../../evidence/week-06/test-run-4-boundary-after-fix-3-passed.png) |
| All tests after the fix (regression) | 39 | 39 passed, 19.4 s | [screenshot](../../evidence/week-06/test-run-5-all-after-fix-39-passed.png) |

(A theory with several inputs counts once per input, so 34 test methods give 39 test cases.)

## 2. Automated test cases

| ID | Component / objective | Input | Expected result | Actual result | Status |
|----|-----------------------|-------|-----------------|---------------|--------|
| TC01 | Auth: reject wrong password | Registered e-mail, wrong password | Login refused | Login refused | PASS |
| TC02 | Auth: no second account with the same e-mail | Same e-mail in capital letters | Registration refused | Refused | PASS |
| TC03 | Auth: e-mail is not case sensitive | E-mail in capital letters, right password | Token returned, role Consumer | As expected | PASS |
| TC04 | Change password: wrong current password | Wrong current password | Not changed, old password still works | As expected | PASS |
| TC05 | Change password: success | Right current password, new password | Old password fails, new one works | As expected | PASS |
| TC06 | Search: case-insensitive, inactive hidden | Lower-case name; one active and one inactive listing | Only the active listing | Only the active listing | PASS |
| TC07 | Search: Turkish city in lower case | location = "izmir", listing in "İzmir" | Listing found | Found | PASS |
| TC08 | Create listing: invalid data | Category "toys"; city "Atlantis" | InvalidCategory; InvalidCity; nothing saved | As expected | PASS |
| TC09 | Edit listing: other farmer | Farmer B edits farmer A's listing | Not found, price unchanged | As expected | PASS |
| TC10 | Edit listing: unit locked | Change kg → box on a listing with an order | UnitLocked | UnitLocked | PASS |
| TC11 | Order: normal case | 10 kg from 50 kg at 20 TL | Order Pending, total 200 TL, stock 40 | As expected | PASS |
| TC12 | Order: zero / negative quantity | 0; -1 | InvalidQuantity, stock 50 | As expected | PASS |
| TC13 | Order: more than the stock | 51 kg from 50 kg | InsufficientStock, stock 50 | As expected | PASS |
| TC14 | Order: exactly the whole stock | 50 kg from 50 kg | Stock 0, listing inactive and hidden | As expected | PASS |
| TC15 | Order: decimal for a piece unit | 1.5 pieces | InvalidQuantity | InvalidQuantity | PASS |
| TC16 | Order: inactive listing | 1 kg from an inactive listing | ListingNotFound | ListingNotFound | PASS |
| TC17 | Order: second order with an old stock value | Two DbContexts read stock 50; both order 10 kg | First saved, second StockChanged; stock 40, one order | As expected | PASS |
| TC18 | Status: other farmer's order | Farmer B sets farmer A's order to Delivered | NotYourOrder, status stays Pending | As expected | PASS |
| TC19 | Status: only forward | Pending → Preparing → Delivered → Pending | First two succeed, last InvalidTransition | As expected | PASS |
| TC20 | Status: farmer cannot cancel | Status Cancelled by farmer | InvalidTransition | InvalidTransition | PASS |
| TC21 | Cancel: returns stock, only once | Cancel 10 kg order twice | First Cancelled and stock 50; second NotPending | As expected | PASS |
| TC22 | Edit order while Preparing | Quantity 10 → 12; then only the address | QuantityLocked; address changed; stock 40 | As expected | PASS |
| TC23 | Notifications | Two orders, one cancelled; then mark seen | Unseen count 1, then 0 | 1, then 0 | PASS |
| TC24 | API: wrong password | POST /api/auth/login | 401, ProblemDetails "Email or password is incorrect." | As expected | PASS |
| TC25 | API: no token | POST /api/orders without token | 401 with problem+json body | As expected | PASS |
| TC26 | API: consumer creates a listing | POST /api/listings as consumer | 403 | 403 | PASS |
| TC27 | API: consumer reads received orders | GET /api/orders/received as consumer | 403 with problem+json body | As expected | PASS |
| TC28 | API: other farmer changes status (open item from Week 5) | PATCH /api/orders/{id}/status as farmer B | 403 with ownership message; owner still sees Pending | As expected | PASS |
| TC29 | API: complete order flow | Register both roles → listing → search → order 10 kg → Preparing → Delivered | 201, stock 40, consumer sees Delivered | As expected | PASS |
| TC30 | API: invalid quantity | 0; -1; 51 | 400 with a non-empty detail message | As expected | PASS |
| TC31 | API: five parallel orders | 5 consumers × 10 kg from 20 kg at the same moment | 1–2 created; others 400, 404 or 409; stock = 20 − 10 × created | As expected (stock never negative) | PASS |
| TC32 | NFR-01 search time | 1,000 extra listings; 3 queries × 20 requests | p95 below 2,000 ms | See section 4 (max p95 32.1 ms) | PASS |
| TC33 | Boundary: more than two decimals | 0.001 kg; 10.555 kg | InvalidQuantity, stock 50 | Before fix: accepted (see section 3). After fix: InvalidQuantity | FAIL → PASS |
| TC34 | Robustness: two sign-ups at the same moment | Two parallel POST /api/auth/register, same e-mail | 200 and 409 | Before fix: 200 and 500. After fix: 200 and 409 | FAIL → PASS |

## 3. Failures, diagnosis and correction

### TC33 – Quantities with more than two decimals

* **Observed (before the fix):** quantity 0.001 → no error, an order of **0.00 kg** was saved and the stock stayed 50.00.
  Quantity 10.555 → the order was saved as 10.56 kg but the stock became 39.45 kg, so 50.01 kg was sold from a 50 kg listing.
* **Diagnosis:** `Order.Quantity` and `Listing.AvailableQuantity` are `decimal(10,2)` in SQL Server, which rounds extra
  decimals when saving. `OrderService.CheckQuantity` only checked "greater than zero" and "whole number for pieces and boxes".
  The two values were rounded separately, so the order and the stock no longer matched, and a zero order could be created (NFR-02).
* **Correction:** `CheckQuantity` now rejects a quantity whose value changes when rounded to two decimals
  ("Quantity can have at most two decimal places."). The rule is used by both placing and editing an order.
* **Retest:** the same TC33 cases passed; all 39 tests passed. Commit [1bc7993](https://github.com/hasanackl/cropmarket/commit/1bc7993).

### TC34 – Two sign-ups with the same e-mail at the same moment

* **Observed (before the fix):** status codes 200 and **500**. Log: `SqlException 2601: Cannot insert duplicate key row
  in object 'dbo.Users' with unique index 'IX_Users_Email'`, caught by `GlobalExceptionHandler` as an unhandled exception.
* **Diagnosis:** `AuthService.RegisterAsync` first checks whether the e-mail exists and then inserts the user
  (check-then-act). Both requests passed the check before either insert; the unique index correctly stopped the second insert,
  but the `DbUpdateException` was not handled, so the user would see a server error instead of "already registered".
* **Correction:** `RegisterAsync` catches `DbUpdateException`; if the e-mail now exists it returns the normal
  "already registered" result (409), otherwise the exception is thrown again.
* **Retest:** TC34 passed with 200 and 409; all 39 tests passed. Commit [1bc7993](https://github.com/hasanackl/cropmarket/commit/1bc7993).

### Problems found while preparing the tests

* TC31 first expected only 400 or 409 for the losing requests. A preliminary run showed 404 as well: when the stock reaches
  zero the listing becomes inactive and later orders get "not found or no longer active". This is the designed behaviour,
  so the test expectation was corrected (test defect, not a product defect).
* The service tests and API tests were first in two xUnit collections that run in parallel; both would have deleted and
  re-created the same test database. They were moved into one collection.

## 4. NFR-01 measurement (TC32)

1,000 active listings were added to the test database (in addition to the listings created by other tests), then each
query was sent 20 times through the API after one warm-up request.

| Query | Rows returned | Average | p95 | Max |
|-------|---------------|---------|-----|-----|
| GET /api/listings | 1,005 | 19.6 ms | 32.1 ms | 34.7 ms |
| GET /api/listings?search=tomato | 129 | 7.0 ms | 8.9 ms | 10.0 ms |
| GET /api/listings?category=fruits&location=Manisa | 50 | 4.0 ms | 4.9 ms | 20.3 ms |

The requirement (results within 2 seconds with 100 listings) is met with ten times more listings. The API ran in memory,
so network and browser rendering time are not included.

## 5. Manual UI tests

| ID | Scenario | Expected result | Actual result | Status | Evidence |
|----|----------|-----------------|---------------|--------|----------|
| UI-01 | Log in with a wrong password | Red error message, not logged in | "Email or password is incorrect." | PASS | [ui01](../../evidence/week-06/ui01-wrong-password.png) |
| UI-02 | Farmer creates "Tomato", 50 kg, Manisa, with photo | Form accepts the data, preview shows the photo | Form and live preview correct | PASS (form) | [ui02](../../evidence/week-06/ui02-new-listing.png) |
| UI-03 | Consumer searches "toma" | Only tomato listings | 2 Tomato listings (Manisa, İzmir) | PASS | [ui03](../../evidence/week-06/ui03-search.png) |
| UI-04 | Order 0.001 kg in the web app | Error message, no order | Not performed | Not run | – |
| UI-05 | Consumer orders 10 kg | Success message, stock 40 kg | "You will pay ₺750.00 on delivery", stock 40 kg | PASS | [ui05](../../evidence/week-06/ui05-order-success.png) |
| UI-06 | Farmer sees the new order in the bell | Bell lists the new order | "Ayse Demir ordered 10 kg of Tomato" | PASS | [ui06](../../evidence/week-06/ui06-farmer-bell.png) |
| UI-07 | Consumer follows the order status | Current status shown | Order #10 shown as Preparing | PASS | [ui07](../../evidence/week-06/ui07-consumer-orders.png) |
| UI-08 | Switch the language to Turkish | Menus and buttons in Turkish | Turkish interface (product names are user data and stay as entered) | PASS | [ui08](../../evidence/week-06/ui08-turkish.png) |

## 6. Remaining limitations

* UI-04 (the new two-decimal message in the browser) was not checked manually; the rule is covered by TC33 at service level.
* The quantity of a listing (`AvailableQuantity` when creating or editing) still accepts more than two decimals; only
  `[Range]` is checked. It was not tested and is left for Week 7.
* The React client has no automated tests; UI checks are manual.
* NFR-01 was measured inside the test process (no network, no browser). A browser measurement is planned with the installation guide in Week 7.
* Photo upload (FR-12) and the city list (FR-11) were not covered by new automated tests; they were checked manually in Week 5.
* FR-14 (logout when the token expires) has no automated test.
