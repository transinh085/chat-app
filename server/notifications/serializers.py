from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id',  'receiver', 'title', 'message', 'seen', 'created_at']
    