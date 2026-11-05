# Development Stage 1 – First Working Prototype (Week 4)

## Goal
Build one thin path through the Week 3 architecture before adding orders:
a farmer registers and publishes a listing, and a consumer finds it by searching.

## Implemented requirements
| ID | Requirement | Where |
|----|-------------|-------|
| FR-01 | Register and log in as a farmer or a consumer (JWT) | `AuthController`, `AuthService`, `TokenService`, `PasswordHasher`; Register and Login pages |
| FR-02 | A logged-in farmer creates a listing | `ListingsController` (`[Authorize(Roles = "Farmer")]`), `ListingService`; New Listing page |
| FR-03 | Search listings by name and filter by category and location | `GET /api/listings?search=&category=&location=`; Home page |

## API endpoints
| Method | Endpoint | Access | Result |
|--------|----------|--------|--------|
| POST | /api/auth/register | Anyone | 200 + token, 409 if the email is taken |
| POST | /api/auth/login | Anyone | 200 + token, 401 for a wrong email or password |
| GET | /api/listings | Anyone | Active listings that match the filters |
| GET | /api/listings/{id} | Anyone | One listing, 404 if not found |
| POST | /api/listings | Farmer | 201 + created listing, 400 for invalid data, 403 for a consumer |

## Structure
The solution follows a layered (clean) architecture. Core holds the entities and the service interfaces and does not
depend on any framework. Infrastructure implements them with EF Core, BCrypt and JWT. Presentation contains the
Web API and the React client. Passwords are stored only as BCrypt hashes; the JWT signing key is kept in user secrets,
not in the repository.

## Preliminary verification
Requests from `Presentation/CropMarket.API/CropMarket.API.http` (screenshots `evidence/week-04/p01.png` … `p09.png`)
and manual checks in the browser.

| ID | Action | Expected | Result |
|----|--------|----------|--------|
| P01 | Register a farmer | 200 + token | Pass |
| P02 | Register a consumer | 200 + token | Pass |
| P03 | Farmer logs in | 200 + token | Pass |
| P04 | Farmer creates "Tomato" | 201 Created | Pass |
| P05 | Search "tomato" (lower case) | 1 result | Pass |
| P06 | Consumer logs in | 200 + token | Pass |
| P07 | Consumer creates a listing | 403 Forbidden | Pass |
| P08 | Wrong password | 401 | Pass |
| P09 | Empty name, price -5, quantity 0 | 400 with field errors | Pass |
| P10 | Register a farmer in the web client | Logged in, "New Listing" button shown | Pass |
| P11 | Publish "Cucumber" in the web client | Listing appears on the home page | Pass |
| P12 | Search "cucumber" in the web client | 1 result | Pass |
| P13 | Switch the interface to Turkish | Texts and categories in Turkish | Pass |

These checks do not replace the full testing planned for Week 6.

## Problems and solutions
- A transitive package (System.Security.Cryptography.Pkcs 9.0.11) had known vulnerabilities; it was fixed by
  referencing the patched version directly.
- TypeScript 7 was not yet supported by typescript-eslint; TypeScript was pinned to 6.0.
- The web client expects lower-case enum values ("farmer", "kg"); the API now writes enums in camelCase and still
  accepts both forms.

## Commits
| Commit | Description |
|--------|-------------|
| 38937db | Scaffold the ASP.NET Core API and the React client |
| 4272bef | Register, login, create listing and search API |
| 985d13f | Send enums as camelCase text for the web client |
| c2f3df7 | Register, login, new listing and search pages |

## Limitations and next steps
- Orders, the automatic stock update and order status (FR-04 to FR-06) are not implemented yet (Week 5).
- Listings have no photos, and the category is stored as free text.
- There are no automated tests yet (Week 6).