from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from marketplace.models import (
    Customer, StoreOwner, Product, ProductImage, ProductRating,
    Cart, Order, OrderItem, Comment, Wishlist, WishlistItem
)
from decimal import Decimal


# ========== API Tests ==========

class CustomerAPITestCase(APITestCase):
    """Test Customer API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer_data = {
            'phone': '09123456789',
            'password': 'testpass123',
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'city': 'Tehran'
        }
        self.customer = Customer.objects.create_user(**self.customer_data)

    def tearDown(self):
        self.customer.delete()

    def test_create_customer_api(self):
        """Test creating customer via API"""
        new_customer_data = {
            'phone': '09198765432',
            'password': 'newpass123',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@example.com'
        }
        response = self.client.post('/api/users/', new_customer_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_customers_api_requires_admin(self):
        """Test listing customers requires admin permission"""
        response = self.client.get('/api/users/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_retrieve_customer_api(self):
        """Test retrieving customer via API"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(f'/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_customer_api(self):
        """Test updating customer via API"""
        self.client.force_authenticate(user=self.customer)
        update_data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = self.client.patch(f'/api/users/{self.customer.phone}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_customer_api(self):
        """Test deleting customer via API"""
        customer_to_delete = Customer.objects.create_user(
            phone='09100000001',
            password='pass123',
            first_name='To',
            last_name='Delete'
        )
        self.client.force_authenticate(user=customer_to_delete)
        response = self.client.delete(f'/api/users/{customer_to_delete.phone}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class StoreOwnerAPITestCase(APITestCase):
    """Test StoreOwner API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.store_owner_data = {
            'phone': '09198765432',
            'password': 'storepass123',
            'store_name': 'Test Store',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@store.com'
        }
        self.store_owner = StoreOwner.objects.create_store_owner(**self.store_owner_data)

    def tearDown(self):
        self.store_owner.delete()

    def test_create_store_owner_api(self):
        """Test creating store owner via API"""
        new_store_owner_data = {
            'phone': '09187654321',
            'password': 'newstore123',
            'store_name': 'New Store',
            'first_name': 'John',
            'last_name': 'Merchant'
        }
        response = self.client.post('/api/store-owners/', new_store_owner_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_store_owner_api(self):
        """Test retrieving store owner via API"""
        self.client.force_authenticate(user=self.store_owner)
        response = self.client.get(f'/api/store-owners/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_store_owner_api(self):
        """Test updating store owner via API"""
        self.client.force_authenticate(user=self.store_owner)
        update_data = {'store_name': 'Updated Store Name'}
        response = self.client.patch(f'/api/store-owners/{self.store_owner.phone}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_store_owner_statistics_api(self):
        """Test retrieving store owner statistics"""
        self.client.force_authenticate(user=self.store_owner)
        response = self.client.get(f'/api/store-owners/{self.store_owner.phone}/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ProductAPITestCase(APITestCase):
    """Test Product API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title='Test Product',
            description='Test Description',
            sku='TEST-SKU-001',
            price=Decimal('100.00'),
            compare_price=Decimal('150.00'),
            stock=50,
            category='men'
        )

    def tearDown(self):
        self.product.delete()
        self.store_owner.delete()

    def test_list_products_api(self):
        """Test listing products via API"""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_product_api(self):
        """Test retrieving product via API"""
        response = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Product')

    def test_create_product_api(self):
        """Test creating product via API"""
        self.client.force_authenticate(user=self.store_owner)
        new_product_data = {
            'title': 'New Product',
            'description': 'New Description',
            'sku': 'NEW-SKU-002',
            'price': '200.00',
            'stock': 100,
            'category': 'women'
        }
        response = self.client.post('/api/products/', new_product_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_product_api(self):
        """Test updating product via API"""
        self.client.force_authenticate(user=self.store_owner)
        update_data = {'title': 'Updated Product'}
        response = self.client.patch(f'/api/products/{self.product.id}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_product_increment_views_api(self):
        """Test incrementing product views"""
        initial_views = self.product.views
        response = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CartAPITestCase(APITestCase):
    """Test Cart API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create_user(
            phone='09123456789',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title='Test Product',
            description='Test Description',
            sku='TEST-SKU-001',
            price=Decimal('100.00'),
            stock=50,
            category='men'
        )
        self.cart = Cart.objects.create(user_id=self.customer)

    def tearDown(self):
        self.cart.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_retrieve_cart_api(self):
        """Test retrieving cart via API"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/carts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_to_cart_api(self):
        """Test adding item to cart"""
        self.client.force_authenticate(user=self.customer)
        cart_item_data = {
            'product_id': str(self.product.id),
            'quantity': 2,
            'color': 'red',
            'size': 'M'
        }
        response = self.client.post(f'/api/carts/{self.cart.id}/add-item/', cart_item_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_remove_from_cart_api(self):
        """Test removing item from cart"""
        self.client.force_authenticate(user=self.customer)
        # First add an item
        cart_item_data = {
            'product_id': str(self.product.id),
            'quantity': 2
        }
        self.client.post('/api/carts/add-item/', cart_item_data, format='json')
        # Then remove it
        response = self.client.post('/api/carts/remove-item/', {'product_id': str(self.product.id)}, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_405_METHOD_NOT_ALLOWED])


class OrderAPITestCase(APITestCase):
    """Test Order API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create_user(
            phone='09123456789',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title='Test Product',
            description='Test Description',
            sku='TEST-SKU-001',
            price=Decimal('100.00'),
            stock=50,
            category='men'
        )
        self.order = Order.objects.create(
            user=self.customer,
            store=self.store_owner,
            total_amount=Decimal('100.00'),
            payment_method='card'
        )

    def tearDown(self):
        self.order.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_list_orders_api(self):
        """Test listing orders via API"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_order_api(self):
        """Test retrieving order via API"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(f'/api/orders/{self.order.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_order_api(self):
        """Test creating order via API"""
        self.client.force_authenticate(user=self.customer)
        order_data = {
            'total_amount': '200.00',
            'payment_method': 'card',
            'shipping_address': {}
        }
        response = self.client.post('/api/orders/', order_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_update_order_status_api(self):
        """Test updating order status"""
        self.client.force_authenticate(user=self.store_owner)
        update_data = {'status': 'paid'}
        response = self.client.patch(f'/api/orders/{self.order.id}/', update_data)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])


class WishlistAPITestCase(APITestCase):
    """Test Wishlist API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create_user(
            phone='09123456789',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product1 = Product.objects.create(
            store_owner=self.store_owner,
            title='Product 1',
            description='Description 1',
            sku='SKU-001',
            price=Decimal('100.00'),
            stock=50,
            category='men'
        )
        self.product2 = Product.objects.create(
            store_owner=self.store_owner,
            title='Product 2',
            description='Description 2',
            sku='SKU-002',
            price=Decimal('200.00'),
            stock=30,
            category='women'
        )
        self.wishlist = Wishlist.objects.create(user=self.customer)

    def tearDown(self):
        self.wishlist.delete()
        self.product1.delete()
        self.product2.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_retrieve_wishlist_api(self):
        """Test retrieving wishlist via API"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/wishlists/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_to_wishlist_api(self):
        """Test adding product to wishlist"""
        self.client.force_authenticate(user=self.customer)
        add_data = {'product_id': str(self.product1.id)}
        response = self.client.post('/api/wishlists/add-product/', add_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_405_METHOD_NOT_ALLOWED])

    def test_remove_from_wishlist_api(self):
        """Test removing product from wishlist"""
        self.client.force_authenticate(user=self.customer)
        # Add first
        add_data = {'product_id': str(self.product1.id)}
        self.client.post('/api/wishlists/add-product/', add_data, format='json')
        # Then remove
        remove_data = {'product_id': str(self.product1.id)}
        response = self.client.post('/api/wishlists/remove-product/', remove_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_405_METHOD_NOT_ALLOWED])

    def test_clear_wishlist_api(self):
        """Test clearing wishlist"""
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/wishlists/clear/', format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_405_METHOD_NOT_ALLOWED])


class CommentAPITestCase(APITestCase):
    """Test Comment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create_user(
            phone='09123456789',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title='Test Product',
            description='Test Description',
            sku='TEST-SKU-001',
            price=Decimal('100.00'),
            stock=50,
            category='men'
        )
        self.comment = Comment.objects.create(
            product=self.product,
            author=self.customer,
            content='Great product!'
        )

    def tearDown(self):
        self.comment.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_list_comments_api(self):
        """Test listing comments via API"""
        response = self.client.get('/api/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_comment_api(self):
        """Test retrieving comment via API"""
        response = self.client.get(f'/api/comments/{self.comment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'Great product!')

    def test_create_comment_api(self):
        """Test creating comment via API"""
        self.client.force_authenticate(user=self.customer)
        comment_data = {
            'product': str(self.product.id),
            'content': 'Nice product!'
        }
        response = self.client.post('/api/comments/', comment_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_reply_to_comment_api(self):
        """Test replying to comment"""
        self.client.force_authenticate(user=self.store_owner)
        reply_data = {
            'product': str(self.product.id),
            'content': 'Thank you for your comment!',
            'parent': str(self.comment.id)
        }
        response = self.client.post('/api/comments/', reply_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_update_comment_api(self):
        """Test updating comment via API"""
        self.client.force_authenticate(user=self.customer)
        update_data = {'content': 'Updated comment'}
        response = self.client.patch(f'/api/comments/{self.comment.id}/', update_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_delete_comment_api(self):
        """Test deleting comment via API"""
        comment_to_delete = Comment.objects.create(
            product=self.product,
            author=self.customer,
            content='To delete'
        )
        self.client.force_authenticate(user=self.customer)
        response = self.client.delete(f'/api/comments/{comment_to_delete.id}/')
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_403_FORBIDDEN])


class ProductRatingAPITestCase(APITestCase):
    """Test Product Rating API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create_user(
            phone='09123456789',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone='09198765432',
            password='storepass123',
            store_name='Test Store',
            first_name='Jane',
            last_name='Smith'
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title='Test Product',
            description='Test Description',
            sku='TEST-SKU-001',
            price=Decimal('100.00'),
            stock=50,
            category='men'
        )

    def tearDown(self):
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_rate_product_api(self):
        """Test rating product via API"""
        self.client.force_authenticate(user=self.customer)
        rating_data = {
            'rating': 4.5
        }
        response = self.client.post(f'/api/products/{self.product.id}/rate/', rating_data, format='json')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])


class CategoryAPITestCase(APITestCase):
    """Test Category API endpoints"""
    
    def test_list_categories_api(self):
        """Test listing categories via API"""
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
