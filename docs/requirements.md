# CropTrader – Requirements (Week 2, extended in Week 5)

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | The system shall allow a user to register and log in with an email address and a password, choosing the role of either farmer or consumer. | Must |
| FR-02 | The system shall allow a logged-in farmer to create a product listing with a product name, category, unit price, available quantity and location. | Must |
| FR-03 | The system shall display all active product listings and allow consumers to search them by product name and filter them by category or location. | Must |
| FR-04 | The system shall allow a consumer to place an order for a chosen quantity from a listing and shall record cash on delivery as the payment method. | Must |
| FR-05 | The system shall reduce the available quantity of a listing automatically by the ordered amount when an order is placed. | Must |
| FR-06 | The system shall allow a farmer to view the orders placed on their listings and change the status of each order to Pending, Preparing or Delivered. | Should |
| FR-07 | The system shall allow a consumer to change the quantity of an order while it is Pending and the delivery address until it is delivered, and shall correct the stock accordingly. *(added in Week 5)* | Should |
| FR-08 | The system shall allow a consumer to cancel an order while it is Pending and shall return the ordered quantity to the stock. *(added in Week 5)* | Should |
| FR-09 | The system shall notify a farmer of new orders on their listings with a counter and a list of the newest orders. *(added in Week 5)* | Could |
| FR-10 | The system shall allow a farmer to view and edit their own listings; the unit cannot be changed once the listing has orders. *(added in Week 5)* | Should |
| FR-11 | The system shall offer the 81 provinces of Türkiye, stored in the database, as the location of a listing. *(added in Week 5)* | Could |
| FR-12 | The system shall allow a farmer to upload one photo (JPG, PNG or WebP, at most 2 MB) for a listing. *(added in Week 5)* | Could |
| FR-13 | The system shall allow a logged-in user to change their password after entering the current password. *(added in Week 5)* | Should |
| FR-14 | The web client shall log the user out automatically when the login token expires. *(added in Week 5)* | Should |

## Non-Functional Requirements

| ID | Quality | Requirement | How to verify |
|----|---------|-------------|---------------|
| NFR-01 | Performance | With 100 product listings stored in the database, the system shall display the results of a listing search within 2 seconds. | Measure 10 searches with the browser developer tools; all must be under 2 seconds. |
| NFR-02 | Reliability / validation | The system shall reject an order whose quantity is zero, negative or larger than the available quantity, show an understandable error message and leave the stock unchanged. | API tests and a manual demo with quantities 0, -1 and (available + 1). |
| NFR-03 | Security | Only users with the farmer role shall be able to create listings or change order statuses; such requests from other users shall be rejected with HTTP 403. | Send these requests as a consumer and without logging in; each must be rejected. |

## User Stories

**US-01 – Publishing a product listing** (FR-01, FR-02)
As a farmer, I want to publish a listing for my product with its price and available quantity, so that consumers can find and buy it without an intermediary.
1. Given a logged-in farmer, when they submit the listing form with a name, category, price, quantity and location, the new listing appears in the list of active listings.
2. Given a logged-in farmer, when they submit the form with an empty name or a price of zero or less, the listing is not saved and an error message explains which field is wrong.

**US-02 – Ordering a product directly** (FR-03, FR-04, FR-05)
As a consumer, I want to search for a product and order the amount I need from a farmer, so that I can buy fresh products directly from the producer.
1. Given listings for several products, when the consumer searches for "tomato", only listings whose name contains "tomato" are shown.
2. Given a listing with 50 kg available, when the consumer orders 10 kg, the order is saved with cash on delivery as the payment method and the available quantity becomes 40 kg.

**US-03 – Updating the status of an order** (FR-06)
As a farmer, I want to see the orders placed on my listings and update their status, so that the consumer knows when the order is being prepared and delivered.
1. Given a new order on the farmer's listing, when the farmer opens the orders page, the order is shown with the status Pending.
2. Given a Pending order, when the farmer changes its status to Preparing, the new status is saved and is still shown as Preparing after the page is refreshed.
