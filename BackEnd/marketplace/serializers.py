from rest_framework import serializers
from django.utils import timezone
from .models import User


class UserSerializer(serializers.ModelSerializer):
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.ReadOnlyField()
    has_profile_image = serializers.SerializerMethodField()
    profile_image_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'post_code',
            'birthday',
            'city',
            'is_verified',
            'role',
            'status',
            'last_login',
            'created_at',
            'updated_at',
            'full_name',
            'has_profile_image',
            'profile_image_info',
        ]
        read_only_fields = ['id', 'is_verified', 'last_login', 'created_at', 'updated_at', 'has_profile_image', 'profile_image_info', 'full_name']

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None
    def get_has_profile_image(self, obj):
        return obj.has_profile_image()

    def get_profile_image_info(self, obj):
        info = obj.get_profile_image_info()
        return info

    def validate_birthday(self, value):
        if value and value >= timezone.now().date():
            raise serializers.ValidationError("تاریخ تولد باید در گذشته باشد")
        return value

    def create(self, validated_data):
        password = self.initial_data.get('password')
        user = User(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            post_code=validated_data.get('post_code'),
            birthday=validated_data.get('birthday'),
            city=validated_data.get('city'),
            role=validated_data.get('role', User.Roles.CUSTOMER),
            status=validated_data.get('status', User.Status.ACTIVE),
        )
        if password:
            user.set_password(password)
        else:
            raise serializers.ValidationError({"password": "رمز عبور الزامی است"})
        user.save()
        return user

    def update(self, instance, validated_data):
        for field in ['first_name', 'last_name', 'email', 'phone', 'post_code', 'birthday', 'city', 'role', 'status']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        password = self.initial_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance

