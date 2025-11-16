from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Customer
from .serializers import CustomerSerializer
from .permissions import IsAdminRole, IsSelfOrAdmin


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    lookup_field = 'phone'

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if self.action in ['list']:
            return [IsAdminRole()]
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'upload_image', 'remove_image', 'image_info', 'download_image']:
            return [IsSelfOrAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, pk=None):
        user = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.update_profile_image(file_obj)
        return Response({'detail': 'uploaded', 'profile_image_info': user.get_profile_image_info()})

    @action(detail=True, methods=['delete'], url_path='remove-image')
    def remove_image(self, request, pk=None):
        user = self.get_object()
        if not user.has_profile_image():
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        user.remove_profile_image()
        return Response({'detail': 'removed'})

    @action(detail=True, methods=['get'], url_path='image-info')
    def image_info(self, request, pk=None):
        user = self.get_object()
        info = user.get_profile_image_info()
        if not info:
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        return Response(info)

    @action(detail=True, methods=['get'], url_path='image')
    def download_image(self, request, pk=None):
        user = self.get_object()
        if not user.has_profile_image():
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(user.image_data, content_type=user.image_content_type or 'application/octet-stream')
        if user.image_filename:
            response['Content-Disposition'] = f'inline; filename="{user.image_filename}"'
        return response

