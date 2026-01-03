# Commands
- python manage.py makemigrations
- python manage.py migrate
- python manage.py runserver
- python manage.py createsuperuser    /// create admin account

# Customer
## Post sample to create user:
- POST  http://127.0.0.1:8000/api/users/
- body
  { 
    "first_name": "Qasim", 
    "last_name": "Yusofi", 
    "phone": "09926067529", 
    "password": "StrongPass@123", 
    "email": "qasim@gmail.com", 
    "post_code": "1234567890", 
    "birthday": "2001-04-25", 
    "city": "Tehran" 
  }


## Get to auth fetch data
- POST http://127.0.0.1:8000/api/auth/token/
- body
  {
    "phone":"09926067529" ,"password":"StrongPass@123"
  } 

then get the access token
- GET http://127.0.0.1:8000/api/users/me/
- past access token in auth bearer token
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYyNDU2ODMyLCJpYXQiOjE3NjI0NTMyMzIsImp0aSI6IjIzN2ZiNWRkMThhYTQ0ZDE5ZDk1Y2Q0ZDJiY2QyMzMzIiwidXNlcl9pZCI6IjY5MGNlMGIyMzQ1YjljMDgzYjBiMGFhMyJ9.31dqLjcBi37j6q74E3e1z_FJFYiKRvR26h1ay0IWYGw



//////////////////////////////
# Store Owner
##  Available API Endpoints

### Store Owner CRUD
- `POST /api/store-owners/` - Create store owner
- `GET /api/store-owners/` - List all store owners (admin only)
- `GET /api/store-owners/me/` - Retrieve store owner
- `PUT /api/store-owners/me/` - Update store owner
- `PATCH /api/store-owners/me/` - Partial update store owner
- `DELETE /api/store-owners/me/` - Delete store owner

### Image Management
- `POST /api/store-owners/me/upload-profile-image/` - Upload profile image
- `DELETE /api/store-owners/me/remove-profile-image/` - Remove profile image
- `GET /api/store-owners/me/profile-image-info/` - Get profile image metadata
- `GET /api/store-owners/me/profile-image/` - Download profile image

- `POST /api/store-owners/me/upload-store-logo/` - Upload store logo
- `DELETE /api/store-owners/me/remove-store-logo/` - Remove store logo
- `GET /api/store-owners/me/store-logo-info/` - Get store logo metadata
- `GET /api/store-owners/me/store-logo/` - Download store logo

### Ratings & Statistics
- `GET /api/store-owners/me/statistics/` - Get store owner statistics
- `POST /api/store-owners/me/rate-seller/` - Rate seller
- `POST /api/store-owners/me/rate-store/` - Rate store

### sample body
{
  "first_name": "علی",
  "last_name": "رضایی",
  "phone": "09926067528",
  "password": "123456",
  "store_name": "فروشگاه الکترونیک رضایی"
}

//////////////////////////////
# Product
## Available API Endpoints

### Product CRUD
- `GET /api/products/` - List products (filtered by status for non-store-owners)
- `GET http://127.0.0.1:8000/api/products/store/{store_owner_id}/`-Fetch Products by Store Owner (Customer API)
- `POST /api/products/` - Create product (store owners only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (store owners/admins only)
- `PATCH /api/products/{id}/` - Partial update product (store owners/admins only)
- `DELETE /api/products/{id}/` - Delete product (store owners/admins only)

### Image Management
- `POST /api/products/{id}/add-image/` - Add image to product
- `DELETE /api/products/{id}/remove-image/{image_id}/` - Remove image by index
- `POST /api/products/{id}/set-primary-image/{image_id}/` - Set image as primary

### Ratings & Analytics
- `POST /api/products/{id}/rate/` - Rate product
- `POST /api/products/{id}/view/` - Increment view count

### Store Owner Specific
- `GET /api/products/my-products/` - Get store owner's products

## Create Product Sample:
- POST http://127.0.0.1:8000/api/products/
- body (authentication required - store owner token)
  {
    "title": "تیشرت مردانه",
    "description": "تیشرت مردانه تمام پنبه سایز متوسط",
    "sku": "TSHIRT-M-MEDIUM",
    "price": 150000,
    "compare_price": 200000,
    "stock": 100,
    "category": "men",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["مشکی", "سفید", "خاکستری"],
    "tags": ["تیشرت", "مردانه", "تمام‌ پنبه"]
  }

## Add Image to Product:
- POST http://127.0.0.1:8000/api/products/{id}/add-image/
- body (form-data with file)
  - file: [image file]

## Rate Product:
- POST http://127.0.0.1:8000/api/products/{id}/rate/
- body
  {
    "rating": 4.5
  }

## Increment View Count:
- POST http://127.0.0.1:8000/api/products/{id}/view/

//////////////////////////////
# Category API for Home Page
##  Available API Endpoints

### Get Stores by Category
- `GET /api/categories/{category}/stores/` - Get all stores that have products in the specified category

**Valid Categories:** men, women, kids


### Get Products by Store and Category
- `GET /api/categories/{category}/stores/{store_id}/products/` - 

//////////////////////////////
# Cart

### Cart CRUD
- `GET /api/carts/me/` - Get current user's cart
- `PUT /api/carts/me/` - Update cart items (replace all)
- `PATCH /api/carts/me/` - Partial update cart items
- `DELETE /api/carts/me/` - Delete cart (clear all items)

### Cart Item Management
- `POST /api/carts/me/add-item/` - Add item to cart
- `PUT /api/carts/me/update-item/{product_id}/` - Update item quantity/color/size
- `DELETE /api/carts/me/remove-item/{product_id}/` - Remove item from cart
- `POST /api/carts/me/clear/` - Clear all items from cart

### Cart Information
- `GET /api/carts/me/summary/` - Get cart summary with totals

##  API Usage Examples

### Get Cart
```bash
GET /api/carts/me/
Authorization: Bearer <customer_token>
```

### Add Item to Cart
```bash
POST /api/carts/me/add-item/
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "product_id": "693f127d61cbf72a8ad3cd97",
  "quantity": 1,
  "price_snapshot": 150000.00,
  "color": "سفید",
  "size": "L",
  "owner_store_id": "69355abeeaded8b87b904951"
}
```

### Update Item Quantity
```bash
PUT /api/carts/me/update-item/6790ce0b234b9c083b0aaf4/
Authorization: Bearer <customer_token>
Content-Type: application/json


### Remove Item from Cart
```bash
DELETE /api/carts/me/remove-item/{product_id}/
Authorization: Bearer <customer_token>
```


### Clear Cart
```bash
POST /api/carts/me/clear/
Authorization: Bearer <customer_token>
```


//////////////////////////////
# Comments

### Comment CRUD
- `GET /api/comments/` - List all comments (optionally filtered by product_id)
- `POST /api/comments/` - Create new comment on a product (authenticated users)
- `GET /api/comments/{id}/` - Get specific comment with replies
- `PUT /api/comments/{id}/` - Update own comment (only author)
- `PATCH /api/comments/{id}/` - Partial update own comment (only author)
- `DELETE /api/comments/{id}/` - Delete own comment (author or admin)

### Comment Features
- `GET /api/comments/product/{product_id}/` - Get all comments for a specific product
- `POST /api/comments/{id}/reply/` - Reply to a specific comment

## Permissions
- **Customers**: Can create top-level comments on any product
- **Store Owners**: Can reply to comments on their own products
- **Admins**: Can reply to comments on any product

## API Usage Examples

### Create Comment
```bash
POST /api/comments/
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "product": "6790ce0b234b9c083b0aaf4",
  "content": "این محصول عالی است!"
}
```

### Reply to Comment
```bash
POST /api/comments/{comment_id}/reply/
Authorization: Bearer <store_owner_token>
Content-Type: application/json

{
  "content": "ممنون از نظر شما. خوشحالیم که راضی هستید."
}
```

### Get Product Comments
```bash
GET /api/comments/product/{product_id}/
```

### Update Own Comment
```bash
PUT /api/comments/{comment_id}/
Authorization: Bearer <author_token>
Content-Type: application/json

{
  "content": "محصول عالی است، پیشنهاد می‌کنم!"
}
```

//////////////////////////////
# Order

### Order CRUD
- `POST /api/orders/` - Create new order from cart items (customers only)
- `GET /api/orders/` - List orders (filtered by user type)
- `GET /api/orders/{id}/` - Get order details
- `PUT /api/orders/{id}/` - Update order (store owners/admins only)
- `PATCH /api/orders/{id}/` - Partial update order (store owners/admins only)
- `DELETE /api/orders/{id}/` - Delete order (admins only)

### Order Management
- `POST /api/orders/{id}/update-status/` - Update order status
- `POST /api/orders/{id}/add-tracking/` - Add tracking number

### User-Specific Endpoints
- `GET /api/orders/my-orders/` - Get current customer's orders
- `GET /api/orders/store-orders/` - Get current store owner's orders

## API Usage Examples

### Create Order
```bash
POST /api/orders/
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "cart_items": [
    {
      "product_id": "6790ce0b234b9c083b0aaf4",
      "quantity": 2,
      "price_snapshot": 150000.00
    },
    {
      "product_id": "6790ce0b234b9c083b0aaf5",
      "quantity": 1,
      "price_snapshot": 200000.00
    }
  ],
  "shipping_address": {
    "firstName": "علی",
    "lastName": "رضایی",
    "address": "تهران، خیابان ولیعصر",
    "city": "تهران",
    "postalCode": "1234567890",
    "phone": "09926067529"
  },
  "payment_method": "online"
}
```

### Get My Orders
```bash
GET /api/orders/my-orders/
Authorization: Bearer <customer_token>
```

### Get Store Orders
```bash
GET /api/orders/store-orders/
Authorization: Bearer <store_owner_token>
```

### Update Order Status
```bash
POST /api/orders/{id}/update-status/
Authorization: Bearer <store_owner_token>
Content-Type: application/json

{
  "status": "paid"
}
```

### Add Tracking Number
```bash
POST /api/orders/{id}/add-tracking/
Authorization: Bearer <store_owner_token>
Content-Type: application/json

{
  "tracking_number": "TRK123456789"
}

//////////////////////////////
# Wishlist

### Wishlist CRUD
- `GET /api/wishlists/me/` - Get current user's wishlist with populated products
- `GET /api/wishlists/{id}/` - Get specific wishlist details (admin/customers only)

### Wishlist Management
- `POST /api/wishlists/me/add/` - Add product to wishlist
- `DELETE /api/wishlists/me/remove/{product_id}/` - Remove product from wishlist
- `POST /api/wishlists/me/clear/` - Clear all items from wishlist
- `GET /api/wishlists/me/check/{product_id}/` - Check if product is in user's wishlist

## API Usage Examples

### Add Product to Wishlist
```bash
POST /api/wishlists/me/add/
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "product_id": "6790ce0b234b9c083b0aaf4"
}
```
