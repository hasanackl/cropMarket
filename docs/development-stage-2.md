# Development Stage 2 – Placing Orders and Reducing Stock (Week 5)

## Record

| Field | Description |
|-------|-------------|
| Date | 16 November 2026 |
| Objective | Let a consumer order a product directly from a listing, with cash on delivery, and reduce the stock safely. This is the missing link of the main user scenario (US-02). |
| Requirement IDs | FR-04, FR-05, NFR-02, NFR-03 |
| Implemented functionality | A logged-in consumer opens a listing, enters a quantity and a delivery address and places the order. The order stores the unit price at the time of the order, the total price and the payment method (cash on delivery). The available quantity of the listing is reduced in the same database transaction, and a sold-out listing is hidden from the search. Invalid quantities (0, negative, more than the stock, decimals for pieces or boxes) are rejected with HTTP 400 and the stock does not change. |
| Main files / modules | `Order`, `OrderStatus`, `PaymentMethod` (Domain); `OrderConfiguration`, migration `AddOrders` (Persistence); `Features/Orders/OrderService`, `CreateOrderRequest`, `CreateOrderResult` (Application); `OrdersController` (API); `ListingDetail` page and `OrderForm` component (Web) |
| Engineering decision | The order and the stock update are saved with one `SaveChanges` call, so they succeed or fail together. `Listing.RowVersion` is a concurrency token: if two consumers order the last units at the same time, the second save fails with `DbUpdateConcurrencyException` and the API returns 409 instead of selling the same stock twice (ADR-02). The services were also moved from Persistence to `Application/Features`, and they use the database only through `IAppDbContext`. |
| Technical problem | Visual Studio's `.http` file reported HTTP0012 for named requests: a request that used `{{consumerLogin.response...}}` failed because the login request had not been sent in the same session. |
| Solution | The login requests (3, 6) and the listing request (10) are sent first, in the same session, before the order tests. |
| Screenshot / evidence | [Order created, stock 40](../evidence/week-05/http11-order-created.png), [quantity 0](../evidence/week-05/http12-quantity-zero-400.png), [quantity -1](../evidence/week-05/http13-quantity-negative-400.png), [more than stock](../evidence/week-05/http14-over-stock-400.png), [farmer cannot order](../evidence/week-05/http15-farmer-order-403.png), [no token](../evidence/week-05/http16-no-token-401.png), [listing not found](../evidence/week-05/http17-listing-404.png), [stock unchanged](../evidence/week-05/http18-stock-40.png), [web order form](../evidence/week-05/04-web-order-form.png), [web order placed](../evidence/week-05/05-web-order-success.png) |
| GitHub commits | [0240a8e](https://github.com/hasanackl/cropmarket/commit/0240a8e) Order entity and migration, [12953d1](https://github.com/hasanackl/cropmarket/commit/12953d1) services moved to Application features, [b8b1bba](https://github.com/hasanackl/cropmarket/commit/b8b1bba) place orders and reduce stock, [03e9f5a](https://github.com/hasanackl/cropmarket/commit/03e9f5a) listing detail page with order form |
| Next step | Let the farmer see the orders and change their status, and let the consumer follow them (Stage 3). |

## API

| Method | Endpoint | Access | Result |
|--------|----------|--------|--------|
| POST | /api/orders | Consumer | 201 + order with `remainingQuantity`; 400 invalid quantity; 401 no token; 403 farmer; 404 listing not found; 409 stock changed at the same time |

## Verification

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| 11 | Order 10 kg from a 50 kg listing | 201, remaining 40 | Pass |
| 12 | Quantity 0 | 400 | Pass |
| 13 | Quantity -1 | 400 | Pass |
| 14 | 41 kg when 40 kg is left | 400, stock stays 40 | Pass |
| 15 | Farmer places an order | 403 | Pass |
| 16 | No token | 401 | Pass |
| 17 | Listing 999999 | 404 | Pass |
| 18 | Read the listing again | availableQuantity 40 | Pass |
| Web | Place an order in the browser | Success message, stock 35 → 30 | Pass |
