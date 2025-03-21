### 1. GET /products - Fetch products with filters

This curl command fetches all products or allows filtering based on name, price range, and stock availability.

Example Request:
```bash
curl -X GET "http://localhost:3000/api/products?name=Laptop&minPrice=100&maxPrice=2000&inStock=true"
```

- `name=Laptop`: Filters products with "Laptop" in their name (case-insensitive).
- `minPrice=100`: Filters products with a price greater than or equal to 100.
- `maxPrice=2000`: Filters products with a price less than or equal to 2000.
- `inStock=true`: Filters products that are in stock.

### 2. POST /cart - Add a product to the cart

This curl command adds a product to the user's cart.

Example Request:
```bash
curl -X POST "http://localhost:3000/api/cart" \
     -H "Content-Type: application/json" \
     -d '{
           "user_id": "60d69bc95f5b2c001c8c585a",
           "product_id": "60d69bf75f5b2c001c8c585b",
           "quantity": 2
         }'
```

- `user_id`: The ID of the user adding items to the cart.
- `product_id`: The ID of the product being added to the cart.
- `quantity`: The quantity of the product being added.

### 3. GET /cart - View the cart

This curl command fetches the user's cart.

Example Request:
```bash
curl -X GET "http://localhost:3000/api/cart?user_id=60d69bc95f5b2c001c8c585a"
```

- `user_id`: The ID of the user whose cart you want to view.

### 4. POST /checkout - Place an order

This curl command places an order for the products in the user's cart.

Example Request:
```bash
curl -X POST "http://localhost:3000/api/checkout" \
     -H "Content-Type: application/json" \
     -d '{
           "user_id": "60d69bc95f5b2c001c8c585a"
         }'
```

- `user_id`: The ID of the user placing the order. The cart items for this user will be processed and converted into an order.

### 5. GET /orders - Fetch past orders

This curl command fetches past orders placed by a user. You can also filter by a date range.

Example Request (without date filter):
```bash
curl -X GET "http://localhost:3000/api/orders?user_id=60d69bc95f5b2c001c8c585a"
```

Example Request (with date range filter):
```bash
curl -X GET "http://localhost:3000/api/orders?user_id=60d69bc95f5b2c001c8c585a&startDate=2023-01-01&endDate=2023-12-31"
```

- `user_id`: The ID of the user whose orders you want to view.
- `startDate` and `endDate`: (Optional) Filters orders within the specified date range (in the format `YYYY-MM-DD`).

---

Replace `user_id` and `product_id` in the curl commands with valid IDs from your database.

### For data population: Run the Data Population Script

After creating the populateData.js file, we need to run it to populate data in the MongoDB database.

Run the script:

```bash
node populateData.js
```

This script will:

- Add 3 products (Laptop, Smartphone, and Headphones) to the Product collection.
- Add a sample Cart with items (2 Laptops and 3 Smartphones).
- Create an Order from the cart and add the corresponding OrderItems.