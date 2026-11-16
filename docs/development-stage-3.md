# Development Stage 3 – Order Management and the Complete Marketplace Workflow (Week 5)

## How Stage 3 differs from Stage 2

Stage 2 added one operation: a consumer places an order and the stock goes down. Stage 3 connects both roles and
all components into the full workflow of the marketplace: the farmer publishes and edits a listing with a photo, the
consumer orders it, the farmer is notified, prepares and delivers the order, and the consumer follows the status, can
change or cancel the order while it is pending, and sees the result after a refresh. It also adds the
account and quality features that make the system usable every day (FR-07 to FR-14).

## Record

| Field | Description |
|-------|-------------|
| Date | 16–17 November 2026 |
| Objective | Complete the main workflow of US-02 and US-03 for both roles and add the remaining features of the first version. |
| Requirement IDs | FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, NFR-02, NFR-03 |
| Implemented functionality | **Order management (FR-06):** the consumer sees own orders (`/api/orders/mine`); the farmer sees orders on own listings (`/api/orders/received`) and moves them Pending → Preparing → Delivered, only forward; a farmer cannot change another farmer's order. **Order edit and cancel (FR-07, FR-08):** while an order is pending, the consumer can change the amount or cancel it, and the address can be changed until delivery; the stock is corrected in the same transaction. **Notifications (FR-09):** a bell shows the farmer how many new orders arrived and lists the newest five. **Listings (FR-10, FR-12):** the farmer sees own listings with order counts, edits them (the unit is locked once a listing has orders) and uploads a photo (JPG, PNG or WebP, max 2 MB). **Cities (FR-11):** the 81 provinces come from a `City` table instead of a fixed list in the frontend. **Account (FR-13, FR-14):** a settings page lets the user change the password (the current password is required), and the web client logs the user out when the token expires. |
| Main files / modules | Application: `Features/Orders/OrderService` (Update, Cancel, GetReceived, UpdateStatus, unseen orders), `Features/Listings/ListingService` (GetMine, GetForEdit, Update, SetImage), `Features/Cities/CityService`, `Features/Auth/AuthService.ChangePasswordAsync`. Persistence: `CityConfiguration` (81 provinces), migrations `AddOrderCancelAndNotifications`, `AddCitiesAndListingImages`. API: `OrdersController`, `ListingsController`, `CitiesController`, `Services/ImageStorage`, `ErrorHandling/GlobalExceptionHandler`, `Extensions/ClaimsPrincipalExtensions`. Web: `MyOrders`, `FarmerOrders`, `MyListings`, `EditListing`, `Settings` pages; `NotificationBell`, `ListingForm`, `ImagePicker`, `CitySelect`, `ChangePasswordForm`; `AuthProvider` with the logout timer. |
| Engineering decision | The status can only move forward and a cancelled order never changes again; the rule is in `OrderService`, not in the page, so the API enforces it for every client. Services return a Result object with an error type, and the controller turns it into the HTTP status code. Every error now uses the ProblemDetails format, and a global exception handler turns unexpected errors into 500 (or 409 for a concurrency conflict) without exposing a stack trace. |
| Technical problems | (1) The status-change test with a second farmer first returned 200, because the test file logged in with the first farmer's account. (2) The first build after the cities and photo changes failed, because the API was still running in Visual Studio and the DLL files were locked. (3) The unit-lock test returned 200 at first, because it used a new listing that had no orders yet. |
| Solutions | (1) The test data was checked and the login request corrected; the ownership rule (403 for another farmer's order) will be tested again in Week 6. (2) The API is stopped before every build. (3) The test was repeated after an order was placed on the listing and returned 400 as expected. |
| Screenshot / evidence | Status: [Preparing](../evidence/week-05/http22-preparing.png), [cannot go back](../evidence/week-05/http23-back-400.png), [consumer sees Delivered](../evidence/week-05/http29-mine-delivered.png). Edit and cancel: [edited to 8 kg](../evidence/week-05/http32-order-edited.png), [quantity 0](../evidence/week-05/http33-edit-qty0-400.png), [cancelled](../evidence/week-05/http38-order-cancelled.png), [stock restored](../evidence/week-05/http42-stock-restored.png), [web My Orders](../evidence/week-05/06-web-my-orders-cancelled.png), [web Received Orders](../evidence/week-05/08-web-received-orders-cancelled.png). Notifications: [bell](../evidence/week-05/07-web-notification-bell.png), [count after opening](../evidence/week-05/http37-unseen-zero.png). Listings: [edited](../evidence/week-05/http45-listing-edited.png), [unit locked](../evidence/week-05/http48-unit-locked-400.png), [not an image](../evidence/week-05/http50-photo-not-image-400.png), [photo upload form](../evidence/week-05/09-web-new-listing-photo.png), [listing with photo](../evidence/week-05/10-web-listing-detail-photo.png). Account: [wrong password](../evidence/week-05/http52-wrong-password-400.png), [password changed](../evidence/week-05/http54-password-changed-204.png), [settings page](../evidence/week-05/11-web-settings.png). Errors: [401](../evidence/week-05/http57-no-token-401-problem.png), [409](../evidence/week-05/http58-duplicate-email-409-problem.png), [403](../evidence/week-05/http59-consumer-received-403-problem.png). |
| GitHub commits | [334aba8](https://github.com/hasanackl/cropmarket/commit/334aba8) list and update orders, [06b3f5a](https://github.com/hasanackl/cropmarket/commit/06b3f5a) my orders, received orders and my listings pages, [ab9b3a5](https://github.com/hasanackl/cropmarket/commit/ab9b3a5) edit, cancel and notifications API, [aa60624](https://github.com/hasanackl/cropmarket/commit/aa60624) edit, cancel and bell in the web app, [2d80035](https://github.com/hasanackl/cropmarket/commit/2d80035) listing edit, photos and cities, [bb5e6fe](https://github.com/hasanackl/cropmarket/commit/bb5e6fe) settings and password change, [0d6f819](https://github.com/hasanackl/cropmarket/commit/0d6f819) error handling and user id refactor |
| Next step | Week 6: systematic testing (unit tests for `OrderService` rules, API integration tests, NFR-01 search time with 100 listings, the 403 ownership test and the concurrent-order test). |

## End-to-end workflow (example walkthrough)

1. The farmer publishes "Onion", 50 kg, Aydın, with a photo.
2. The consumer searches for "onion", opens the listing and orders 5 kg (cash on delivery). The stock becomes 45 kg.
3. The bell of the farmer shows 1 new order; opening it marks the order as seen.
4. The consumer changes the order to 8 kg while it is pending; the stock becomes 42 kg.
5. The farmer moves the order to Preparing and then Delivered. The consumer can no longer change or cancel it.
6. After a refresh, the consumer sees the status "Delivered" on the My Orders page.

## API added in Stage 3

| Method | Endpoint | Access | Requirement |
|--------|----------|--------|-------------|
| GET | /api/orders/mine | Consumer | US-03 |
| PUT | /api/orders/{id} | Consumer | FR-07 |
| PATCH | /api/orders/{id}/cancel | Consumer | FR-08 |
| GET | /api/orders/received | Farmer | FR-06 |
| PATCH | /api/orders/{id}/status | Farmer | FR-06, NFR-03 |
| GET | /api/orders/received/unseen-count | Farmer | FR-09 |
| GET | /api/orders/received/unseen | Farmer | FR-09 |
| POST | /api/orders/received/mark-seen | Farmer | FR-09 |
| GET | /api/listings/mine | Farmer | FR-10 |
| GET | /api/listings/{id}/edit | Farmer | FR-10 |
| PUT | /api/listings/{id} | Farmer | FR-10 |
| PUT | /api/listings/{id}/image | Farmer | FR-12 |
| GET | /api/cities | Public | FR-11 |
| POST | /api/auth/change-password | Logged in | FR-13 |

## Code quality improvements

| Area | Before | After |
|------|--------|-------|
| Duplicated code | Each controller had its own `GetUserId()` that read the `sub` claim | One extension method `User.GetUserId()` in `Extensions/ClaimsPrincipalExtensions.cs` |
| Error handling | Unhandled exceptions returned the framework's default error response; some endpoints returned `{ message }`, others ProblemDetails | `GlobalExceptionHandler` (`IExceptionHandler`) logs the error and returns ProblemDetails; `UseStatusCodePages` gives empty 401 and 403 responses a body; every controller uses `Problem()` |
| Input validation | Category was free text | Fixed category list (`ListingCategories`), city must exist in the `City` table, photo type and size checked, quantity rules shared by create and edit (`CheckQuantity`) |
| Configuration | CORS address written in `Program.cs` | `Cors:AllowedOrigins` in `appsettings.json`; the JWT key stays in user secrets, never in the repository; uploaded photos are ignored by Git |
