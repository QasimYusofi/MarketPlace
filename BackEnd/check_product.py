import os
import django
from bson import ObjectId

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "BackEnd.settings")
django.setup()

from marketplace.models import Product

product_id = "694ec66f2a1dbe0193174fed"

try:
    product = Product.objects.get(id=product_id)
    print(f"Product found ID: {product.id}")
    print(f"Current Status: {product.status}")
    
    product.status = 'active'
    product.save()
    print(f"New Status: {product.status}")
    
except Product.DoesNotExist:
    print(f"Product with id {product_id} does not exist")
except Exception as e:
    print(f"Error: {e}")
