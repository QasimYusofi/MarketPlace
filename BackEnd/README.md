# Commands
- python manage.py makemigrations
- python manage.py migrate
- python manage.py runserver

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
## 📋 Available API Endpoints

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
## 📋 Available API Endpoints

### Product CRUD
- `GET /api/products/` - List products (filtered by status for non-store-owners)
- `POST /api/products/` - Create product (store owners only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (store owners/admins only)
- `PATCH /api/products/{id}/` - Partial update product (store owners/admins only)
- `DELETE /api/products/{id}/` - Delete product (store owners/admins only)

### Image Management
- `POST /api/products/{id}/add-image/` - Add image to product
- `DELETE /api/products/{id}/remove-image/{image_index}/` - Remove image by index
- `POST /api/products/{id}/set-primary-image/{image_index}/` - Set image as primary

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

## 📝 Product Fields Explanation:

### Required Fields:
- **store_owner**: Auto-set to current authenticated store owner
- **title**: Product name (string, max 255)
- **description**: Product description (text)
- **sku**: Unique product code per store (string, max 100)
- **price**: Product price (decimal, minimum 0)
- **stock**: Available quantity (integer, minimum 0)
- **category**: Product category (men/women/kids/baby)

### Optional Fields:
- **compare_price**: Original price for discount calculation (decimal)
- **sizes**: Array of size options (JSON array)
- **colors**: Array of color options (JSON array)
- **tags**: Array of product tags (JSON array)
- **images**: Array of product images (auto-populated)

### Computed Fields:
- **is_in_stock**: Boolean (stock > 0)
- **is_low_stock**: Boolean (stock <= 10 and stock > 0)
- **discount_percentage**: Integer (calculated from compare_price)
- **images_count**: Integer (number of images)

### Permissions:
- **Create/Update/Delete**: Only store owners (for their products) and admins
- **View**: Everyone can view products (active products for non-store-owners)
- **My Products**: Only authenticated store owners

## 📊 Data Types:

- **price/compare_price**: Decimal (10 digits, 2 decimals)
- **stock/views/sales_count**: Integer
- **sizes/colors/tags**: Array of strings
- **images**: Array of objects with binary data
- **rating**: Object with average (decimal) and count (integer)
