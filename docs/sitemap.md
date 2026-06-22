# LUXE — Application Sitemap

## Page Connection Diagram

```mermaid
flowchart TD
  subgraph PUBLIC["🌐 Public Pages"]
    HOME["/ Home"]
    PRODUCTS["/products — All Products"]
    CAT["/products/:category — Category"]
    DETAIL["/product/:id — Product Detail"]
    ABOUT["/about"]
    CONTACT["/contact"]
    FAQ["/faq"]
    SEARCH["/search — Search Results"]
    NOT_FOUND["/* — 404 Not Found"]
  end

  subgraph AUTH["🔐 Auth-Aware Pages"]
    ACCOUNT["/account — Login / Dashboard"]
    CART["/cart — Shopping Cart"]
    WISHLIST["/wishlist"]
    CHECKOUT["/checkout"]
    SUCCESS["/order-success"]
  end

  subgraph SELLER["🏪 Seller Portal (role: seller)"]
    SELLER_HUB["/seller — Dashboard Overview"]
    SELLER_PRODUCTS["/seller — My Products"]
    SELLER_ORDERS["/seller — Orders"]
    SELLER_ADD["/seller — Add Product"]
  end

  subgraph ADMIN["⚙️ Admin Panel (role: admin)"]
    ADMIN_DASH["/admin — Overview"]
    ADMIN_ORDERS["/admin — Orders"]
    ADMIN_PRODUCTS["/admin — Products"]
    ADMIN_CUSTOMERS["/admin — Customers"]
    ADMIN_REVIEWS["/admin — Reviews"]
  end

  %% Navigation from Home
  HOME --> PRODUCTS
  HOME --> CAT
  HOME --> DETAIL
  HOME --> SEARCH

  %% Product flow
  PRODUCTS --> CAT
  CAT --> DETAIL
  SEARCH --> DETAIL
  DETAIL --> CART
  DETAIL --> WISHLIST

  %% Cart flow
  CART --> CHECKOUT
  CHECKOUT --> SUCCESS

  %% Auth flow
  HOME --> ACCOUNT
  ACCOUNT --> CART
  ACCOUNT --> WISHLIST

  %% Seller flow
  ACCOUNT --> SELLER_HUB
  SELLER_HUB --> SELLER_PRODUCTS
  SELLER_HUB --> SELLER_ORDERS
  SELLER_HUB --> SELLER_ADD

  %% Admin flow
  ACCOUNT --> ADMIN_DASH
  ADMIN_DASH --> ADMIN_ORDERS
  ADMIN_DASH --> ADMIN_PRODUCTS
  ADMIN_DASH --> ADMIN_CUSTOMERS
  ADMIN_DASH --> ADMIN_REVIEWS

  %% Navbar accessible from everywhere
  HOME -.-> ABOUT
  HOME -.-> CONTACT
  HOME -.-> FAQ
  HOME -.-> NOT_FOUND
```

---

## User Roles & Access

| Page              | Guest | Customer | Seller | Admin |
|-------------------|:-----:|:--------:|:------:|:-----:|
| Home, Products    | ✅    | ✅       | ✅     | ✅    |
| Product Detail    | ✅    | ✅       | ✅     | ✅    |
| Write Review      | ❌    | ✅       | ✅     | ✅    |
| Cart / Wishlist   | ✅*   | ✅       | ✅     | ✅    |
| Checkout          | ❌    | ✅       | ✅     | ✅    |
| Account Dashboard | ❌    | ✅       | ✅     | ✅    |
| Seller Dashboard  | ❌    | ❌       | ✅     | ✅    |
| Admin Panel       | ❌    | ❌       | ❌     | ✅    |

> *Guest cart is stored in localStorage and merged on login.

---

## API Route Map

| Method | Endpoint                        | Auth         | Description               |
|--------|---------------------------------|:------------:|---------------------------|
| POST   | /api/auth/register              | —            | Create account            |
| POST   | /api/auth/login                 | —            | Login                     |
| POST   | /api/auth/logout                | ✅           | Logout                    |
| GET    | /api/auth/me                    | ✅           | Get current user          |
| GET    | /api/products                   | —            | List products (paginated) |
| GET    | /api/products/:id               | —            | Single product            |
| GET    | /api/products/categories        | —            | All categories            |
| GET    | /api/cart                       | ✅           | Get cart                  |
| POST   | /api/cart                       | ✅           | Add to cart               |
| PATCH  | /api/cart/:id                   | ✅           | Update quantity           |
| DELETE | /api/cart/:id                   | ✅           | Remove item               |
| POST   | /api/orders                     | ✅           | Place order               |
| GET    | /api/orders                     | ✅           | List my orders            |
| POST   | /api/payments/create-order      | ✅           | Create Razorpay order     |
| POST   | /api/payments/verify            | ✅           | Verify payment (HMAC)     |
| GET    | /api/reviews/:productId         | —            | Get product reviews       |
| POST   | /api/reviews                    | ✅           | Submit review             |
| GET    | /api/seller/stats               | seller/admin | Seller analytics          |
| POST   | /api/seller/products            | seller/admin | Create product            |
| GET    | /api/admin/stats                | admin        | Platform analytics        |
| GET    | /api/admin/orders               | admin        | All orders                |
| PATCH  | /api/admin/orders/:id/status    | admin        | Update order status       |
| PATCH  | /api/admin/reviews/:id          | admin        | Moderate review           |
