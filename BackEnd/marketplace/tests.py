from django.test import TestCase
from django.core.exceptions import ValidationError
from marketplace.models import (
    Customer, StoreOwner, Product, ProductImage, ProductRating,
    Cart, Order, OrderItem, Comment, Wishlist, WishlistItem
)
from decimal import Decimal


class CustomerTestCase(TestCase):
    """Test case for Customer model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            city="Tehran"
        )

    def tearDown(self):
        self.customer.delete()

    def test_customer_creation(self):
        """Test customer creation with all fields"""
        self.assertEqual(self.customer.first_name, "John")
        self.assertEqual(self.customer.last_name, "Doe")
        self.assertEqual(self.customer.phone, "09123456789")
        self.assertEqual(self.customer.email, "john@example.com")
        self.assertFalse(self.customer.is_verified)
        self.assertTrue(self.customer.is_active)
        self.assertEqual(self.customer.user_type, "customer")

    def test_customer_full_name_property(self):
        """Test full_name property"""
        self.assertEqual(self.customer.full_name, "John Doe")

    def test_customer_is_customer_property(self):
        """Test is_customer property returns True"""
        self.assertTrue(self.customer.is_customer)
        self.assertFalse(self.customer.is_store_owner)

    def test_customer_password_hashing(self):
        """Test password hashing"""
        self.assertNotEqual(self.customer.password, "testpass123")
        self.assertTrue(self.customer.check_password("testpass123"))

    def test_customer_unique_phone(self):
        """Test unique phone constraint"""
        with self.assertRaises(Exception):
            Customer.objects.create_user(
                phone="09123456789",
                password="pass123",
                first_name="Jane",
                last_name="Doe"
            )

    def test_customer_unique_email(self):
        """Test unique email constraint"""
        with self.assertRaises(Exception):
            Customer.objects.create_user(
                phone="09199999999",
                password="pass123",
                first_name="Jane",
                last_name="Doe",
                email="john@example.com"
            )


class StoreOwnerTestCase(TestCase):
    """Test case for StoreOwner model"""
    
    def setUp(self):
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith",
            email="jane@store.com",
            city="Isfahan"
        )

    def tearDown(self):
        self.store_owner.delete()

    def test_store_owner_creation(self):
        """Test store owner creation"""
        self.assertEqual(self.store_owner.store_name, "Test Store")
        self.assertEqual(self.store_owner.first_name, "Jane")
        self.assertEqual(self.store_owner.last_name, "Smith")
        self.assertEqual(self.store_owner.phone, "09198765432")
        self.assertEqual(self.store_owner.seller_status, "approved")
        self.assertEqual(self.store_owner.user_type, "store_owner")

    def test_store_owner_full_name_property(self):
        """Test full_name property"""
        self.assertEqual(self.store_owner.full_name, "Jane Smith")

    def test_store_owner_is_store_owner_property(self):
        """Test is_store_owner property returns True"""
        self.assertTrue(self.store_owner.is_store_owner)
        self.assertFalse(self.store_owner.is_customer)

    def test_store_owner_password_hashing(self):
        """Test password hashing"""
        self.assertNotEqual(self.store_owner.password, "storepass123")
        self.assertTrue(self.store_owner.check_password("storepass123"))

    def test_store_owner_rating_update(self):
        """Test seller rating update"""
        self.store_owner.update_seller_rating(4.5)
        self.assertEqual(self.store_owner.seller_rating["average"], 4.5)
        self.assertEqual(self.store_owner.seller_rating["count"], 1)
        
        self.store_owner.update_seller_rating(3.5)
        self.assertEqual(self.store_owner.seller_rating["average"], 4.0)
        self.assertEqual(self.store_owner.seller_rating["count"], 2)

    def test_store_owner_sales_increment(self):
        """Test sales increment"""
        initial_sales = self.store_owner.total_sales
        initial_revenue = self.store_owner.total_revenue
        
        self.store_owner.increment_sales(Decimal("1000.00"))
        self.assertEqual(self.store_owner.total_sales, initial_sales + 1)
        self.assertEqual(self.store_owner.total_revenue, initial_revenue + Decimal("1000.00"))


class ProductTestCase(TestCase):
    """Test case for Product model"""
    
    def setUp(self):
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title="Test Product",
            description="Test Description",
            sku="TEST-SKU-001",
            price=Decimal("100.00"),
            compare_price=Decimal("150.00"),
            stock=50,
            category="men"
        )

    def tearDown(self):
        self.product.delete()
        self.store_owner.delete()

    def test_product_creation(self):
        """Test product creation"""
        self.assertEqual(self.product.title, "Test Product")
        self.assertEqual(self.product.description, "Test Description")
        self.assertEqual(self.product.sku, "TEST-SKU-001")
        self.assertEqual(self.product.price, Decimal("100.00"))
        self.assertEqual(self.product.stock, 50)
        self.assertEqual(self.product.status, "active")

    def test_product_is_in_stock(self):
        """Test in_stock property"""
        self.assertTrue(self.product.is_in_stock)
        self.product.stock = 0
        self.product.save()
        self.assertFalse(self.product.is_in_stock)

    def test_product_is_low_stock(self):
        """Test low_stock property"""
        self.assertFalse(self.product.is_low_stock)
        self.product.stock = 5
        self.product.save()
        self.assertTrue(self.product.is_low_stock)

    def test_product_discount_percentage(self):
        """Test discount calculation"""
        self.assertEqual(self.product.discount_percentage, 33)

    def test_product_unique_sku_per_store(self):
        """Test unique SKU per store constraint"""
        with self.assertRaises(Exception):
            Product.objects.create(
                store_owner=self.store_owner,
                title="Another Product",
                description="Another Description",
                sku="TEST-SKU-001",
                price=Decimal("100.00"),
                stock=50,
                category="women"
            )

    def test_product_increment_views(self):
        """Test view increment"""
        initial_views = self.product.views
        self.product.increment_views()
        self.assertEqual(self.product.views, initial_views + 1)

    def test_product_increment_sales(self):
        """Test sales increment"""
        initial_sales = self.product.sales_count
        self.product.increment_sales()
        self.assertEqual(self.product.sales_count, initial_sales + 1)


class ProductRatingTestCase(TestCase):
    """Test case for ProductRating model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title="Test Product",
            description="Test Description",
            sku="TEST-SKU-001",
            price=Decimal("100.00"),
            stock=50,
            category="men"
        )
        self.rating = ProductRating.objects.create(
            customer=self.customer,
            product=self.product,
            rating=Decimal("4.5")
        )

    def tearDown(self):
        self.rating.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_rating_creation(self):
        """Test rating creation"""
        self.assertEqual(self.rating.rating, Decimal("4.5"))
        self.assertEqual(self.rating.customer, self.customer)
        self.assertEqual(self.rating.product, self.product)

    def test_rating_valid_range(self):
        """Test rating validation"""
        # Valid ratings should work
        for rating_value in [0, 1.5, 3, 4.5, 5]:
            rating = ProductRating.objects.create(
                customer=Customer.objects.create_user(
                    phone=f"0912345678{rating_value}",
                    password="pass",
                    first_name="Test",
                    last_name="User"
                ),
                product=self.product,
                rating=Decimal(str(rating_value))
            )
            rating.delete()

    def test_unique_customer_product_rating(self):
        """Test unique constraint: one rating per customer per product"""
        with self.assertRaises(Exception):
            ProductRating.objects.create(
                customer=self.customer,
                product=self.product,
                rating=Decimal("3.0")
            )


class CartTestCase(TestCase):
    """Test case for Cart model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.cart = Cart.objects.create(user_id=self.customer)

    def tearDown(self):
        self.cart.delete()
        self.customer.delete()

    def test_cart_creation(self):
        """Test cart creation"""
        self.assertEqual(self.cart.user_id, self.customer)
        self.assertEqual(self.cart.items, [])

    def test_cart_one_per_customer(self):
        """Test unique cart per customer"""
        with self.assertRaises(Exception):
            Cart.objects.create(user_id=self.customer)


class OrderTestCase(TestCase):
    """Test case for Order model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title="Test Product",
            description="Test Description",
            sku="TEST-SKU-001",
            price=Decimal("100.00"),
            stock=50,
            category="men"
        )
        self.order = Order.objects.create(
            user=self.customer,
            store=self.store_owner,
            total_amount=Decimal("100.00"),
            payment_method="card",
            status="pending"
        )

    def tearDown(self):
        self.order.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_order_creation(self):
        """Test order creation"""
        self.assertEqual(self.order.user, self.customer)
        self.assertEqual(self.order.store, self.store_owner)
        self.assertEqual(self.order.total_amount, Decimal("100.00"))
        self.assertEqual(self.order.status, "pending")

    def test_order_status_choices(self):
        """Test order status transitions"""
        self.order.status = "paid"
        self.order.save()
        self.assertEqual(self.order.status, "paid")
        
        self.order.status = "shipped"
        self.order.save()
        self.assertEqual(self.order.status, "shipped")


class OrderItemTestCase(TestCase):
    """Test case for OrderItem model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title="Test Product",
            description="Test Description",
            sku="TEST-SKU-001",
            price=Decimal("100.00"),
            stock=50,
            category="men"
        )
        self.order = Order.objects.create(
            user=self.customer,
            store=self.store_owner,
            total_amount=Decimal("200.00"),
            payment_method="card"
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            title="Test Product",
            price=Decimal("100.00"),
            quantity=2
        )

    def tearDown(self):
        self.order_item.delete()
        self.order.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_order_item_creation(self):
        """Test order item creation"""
        self.assertEqual(self.order_item.product, self.product)
        self.assertEqual(self.order_item.quantity, 2)
        self.assertEqual(self.order_item.price, Decimal("100.00"))
        self.assertEqual(self.order_item.total, Decimal("200.00"))

    def test_order_item_total_calculation(self):
        """Test automatic total calculation"""
        self.assertEqual(self.order_item.total, Decimal("200.00"))


class CommentTestCase(TestCase):
    """Test case for Comment model"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product = Product.objects.create(
            store_owner=self.store_owner,
            title="Test Product",
            description="Test Description",
            sku="TEST-SKU-001",
            price=Decimal("100.00"),
            stock=50,
            category="men"
        )
        self.comment = Comment.objects.create(
            product=self.product,
            author=self.customer,
            content="Great product!"
        )

    def tearDown(self):
        self.comment.delete()
        self.product.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_comment_creation(self):
        """Test comment creation"""
        self.assertEqual(self.comment.product, self.product)
        self.assertEqual(self.comment.author, self.customer)
        self.assertEqual(self.comment.content, "Great product!")

    def test_comment_is_reply_property(self):
        """Test is_reply property"""
        self.assertFalse(self.comment.is_reply)
        
        reply = Comment.objects.create(
            product=self.product,
            author=self.store_owner,
            content="Thank you!",
            parent=self.comment
        )
        self.assertTrue(reply.is_reply)
        reply.delete()

    def test_comment_get_replies(self):
        """Test getting replies to comment"""
        reply1 = Comment.objects.create(
            product=self.product,
            author=self.store_owner,
            content="Reply 1",
            parent=self.comment
        )
        reply2 = Comment.objects.create(
            product=self.product,
            author=self.customer,
            content="Reply 2",
            parent=self.comment
        )
        
        replies = self.comment.get_replies()
        self.assertEqual(replies.count(), 2)
        self.assertIn(reply1, replies)
        self.assertIn(reply2, replies)
        
        reply1.delete()
        reply2.delete()


class WishlistTestCase(TestCase):
    """Test case for Wishlist and WishlistItem models"""
    
    def setUp(self):
        self.customer = Customer.objects.create_user(
            phone="09123456789",
            password="testpass123",
            first_name="John",
            last_name="Doe"
        )
        self.store_owner = StoreOwner.objects.create_store_owner(
            phone="09198765432",
            password="storepass123",
            store_name="Test Store",
            first_name="Jane",
            last_name="Smith"
        )
        self.product1 = Product.objects.create(
            store_owner=self.store_owner,
            title="Product 1",
            description="Description 1",
            sku="SKU-001",
            price=Decimal("100.00"),
            stock=50,
            category="men"
        )
        self.product2 = Product.objects.create(
            store_owner=self.store_owner,
            title="Product 2",
            description="Description 2",
            sku="SKU-002",
            price=Decimal("200.00"),
            stock=30,
            category="women"
        )
        self.wishlist = Wishlist.objects.create(user=self.customer)

    def tearDown(self):
        self.wishlist.delete()
        self.product1.delete()
        self.product2.delete()
        self.store_owner.delete()
        self.customer.delete()

    def test_wishlist_creation(self):
        """Test wishlist creation"""
        self.assertEqual(self.wishlist.user, self.customer)
        self.assertEqual(self.wishlist.item_count, 0)

    def test_wishlist_one_per_customer(self):
        """Test unique wishlist per customer"""
        with self.assertRaises(Exception):
            Wishlist.objects.create(user=self.customer)

    def test_wishlist_add_product(self):
        """Test adding product to wishlist"""
        result = self.wishlist.add_product(self.product1.id)
        self.assertTrue(result['added'])
        self.assertEqual(self.wishlist.item_count, 1)
        
        item = WishlistItem.objects.get(wishlist=self.wishlist, product=self.product1)
        self.assertIsNotNone(item)

    def test_wishlist_remove_product(self):
        """Test removing product from wishlist"""
        self.wishlist.add_product(self.product1.id)
        self.assertEqual(self.wishlist.item_count, 1)
        
        result = self.wishlist.remove_product(self.product1.id)
        self.assertTrue(result['removed'])
        self.assertEqual(self.wishlist.item_count, 0)

    def test_wishlist_has_product(self):
        """Test checking if product is in wishlist"""
        self.assertFalse(self.wishlist.has_product(self.product1.id))
        self.wishlist.add_product(self.product1.id)
        self.assertTrue(self.wishlist.has_product(self.product1.id))

    def test_wishlist_clear(self):
        """Test clearing wishlist"""
        self.wishlist.add_product(self.product1.id)
        self.wishlist.add_product(self.product2.id)
        self.assertEqual(self.wishlist.item_count, 2)
        
        result = self.wishlist.clear()
        self.assertTrue(result['cleared'])
        self.assertEqual(self.wishlist.item_count, 0)

    def test_wishlist_unique_constraint(self):
        """Test unique product per wishlist"""
        self.wishlist.add_product(self.product1.id)
        with self.assertRaises(Exception):
            WishlistItem.objects.create(
                wishlist=self.wishlist,
                product=self.product1
            )
