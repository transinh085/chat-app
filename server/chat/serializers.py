from rest_framework import serializers
from authentication.models import User
from django.db.models import Q
from .models import NameCard, Conversation, Message, Participants, DeleteMessage, Attachments, PinConversation, PinnedMessages, CallMessage ,OnlineUser
from django.shortcuts import get_object_or_404

class MemberConversationSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'avatar', 'about', 'status'] 
    
    def get_status(self, obj):
        if obj.id == self.context['request'].user.id:
            return True
        else:
            return OnlineUser.objects.filter(user=obj.id).exists()


class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']
class NewestMessage(serializers.ModelSerializer):
    sender = SenderSerializer()
    class Meta: 
        model = Message
        fields = ['id','message','sender','message_type','created_at']

class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.ListField(child=serializers.PrimaryKeyRelatedField(queryset=User.objects.all()), allow_null=False, write_only=True)
    latest_message = serializers.SerializerMethodField(read_only=True)
    type = serializers.IntegerField(read_only=True)
    members = serializers.SerializerMethodField(read_only=True)
    is_pinned = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'image', 'type', 'latest_message', 'participants', 'members', 'is_pinned', 'admin']

    def create(self, validated_data):
        participants_data = validated_data.pop('participants')
        conversation = Conversation.objects.create(
            title=validated_data.get('title', ''),
            admin=self.context['request'].user
        )

        participants_to_create = []
        participants_to_create.append(Participants(conversation=conversation, user=self.context['request'].user))
        for member in participants_data:
            participants_to_create.append(Participants(conversation=conversation, user=member))
        
        Participants.objects.bulk_create(participants_to_create)

        return conversation
    
    def get_latest_message(self, conversation):
        latest_message = Message.objects.filter(conversation=conversation).exclude(deletemessage__user=self.context['request'].user).order_by('-created_at').first()
        if latest_message:
            return MessageSerializer(latest_message).data
        return None

    def get_members(self, conversation):
        users = User.objects.filter(participants__conversation=conversation)
        return MemberConversationSerializer(users, many=True, context=self.context).data

    def get_is_pinned(self, conversation):
        return PinConversation.objects.filter(user=self.context['request'].user, conversation=conversation).exists()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.title and instance.type == 2:
            other_user = User.objects.filter(participants__conversation=instance).exclude(id=self.context['request'].user.id).first()
            data['title'] = other_user.get_full_name if other_user else ''
        return data

class AddMemberSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'avatar', 'about'] 
    
class CreateParticipantsSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField() 
    users = serializers.PrimaryKeyRelatedField(many=True,queryset=User.objects.all(), write_only=True)
    members = AddMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = Participants
        fields = ['conversation_id', 'users', 'members']
    
    def validate(self, attrs):
        conversation_id = attrs.get('conversation_id')
        users = attrs.get('users')
        if not users: raise serializers.ValidationError({"user": 'Users cannot be empty.'})
        invalid_users = [user for user in users if Participants.objects.filter(conversation__id=conversation_id, user=user).exists()]
        if invalid_users:
            raise serializers.ValidationError({'user': 'One or more users already exist in the conversation.'})
        return attrs
        
    
    def create(self, validated_data):
        conversation_id = validated_data['conversation_id']
        users_data = validated_data['users']
        participants_list = []
        conversation = Conversation.objects.get(id=conversation_id)

        for user in users_data:
            if not Participants.objects.filter(conversation=conversation, user=user).exists():
                participant = Participants.objects.create(conversation=conversation, user=user)
                participants_list.append(participant)
        
        members = User.objects.filter(participants__in=participants_list)
        
        return {
            'conversation_id': conversation_id,
            'members': members.values()
        }

class ParticipantDetailSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(source='pk', read_only=True)
    class Meta:
        model = Participants
        fields = ['id','title']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachments
        fields = '__all__'

class NameCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar', 'email']

class CallMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallMessage
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = SenderSerializer()
    forward = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    namecard = serializers.SerializerMethodField()
    call = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'message', 'message_type', 'created_at', 'sender', 'conversation_id', 'forward', 'attachments', 'namecard', 'is_pinned', 'call']

    def get_forward(self, obj):
        if obj.forward:
            return MessageSerializer(obj.forward, context=self.context).data
        return None
    
    def get_attachments(self, obj):
        try:
            attachments = Attachments.objects.get(message=obj)
            return AttachmentSerializer(attachments).data
        except Attachments.DoesNotExist:
            return None
    
    def get_namecard(self, obj):
        try:
            namecard = NameCard.objects.get(message=obj)
            return NameCardSerializer(namecard.user).data
        except NameCard.DoesNotExist:
            return None
        
    def get_call(self, obj):
        try:
            call = CallMessage.objects.get(message=obj)
            return CallMessageSerializer(call).data
        except CallMessage.DoesNotExist:
            return None
    
class DeleteMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeleteMessage
        fields = '__all__'


class PinConversationSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField()

    def validate_conversation_id(self, value):
        try:
            conversation = Conversation.objects.get(id=value)
        except Conversation.DoesNotExist:
            raise serializers.ValidationError("Conversation does not exist")
        return value

    class Meta:
        model = PinConversation
        fields = ['id', 'user', 'conversation', 'created_at', 'conversation_id']
        extra_kwargs = {
            'user': {'required': False},
            'conversation': {'required': False}
        }

class CloseConversationSerializer(serializers.ModelSerializer):
    conversation_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context['request'].user
        conversation_id = data.get('conversation_id')

        try:
            participant = Participants.objects.get(conversation_id=conversation_id, user=user)
        except Participants.DoesNotExist:
            raise serializers.ValidationError("Conversation does not exist for this user")

        return data

    class Meta:
        model = Participants
        fields = ['id', 'user', 'conversation', 'created_at', 'conversation_id']
        extra_kwargs = {
            'user': {'required': False},
            'conversation': {'required': False}
        }

class PinnedMessagesCreateSerializer(serializers.Serializer):
    message_id = serializers.IntegerField(write_only=True)

    def create(self, validated_data):
        request = self.context.get('request')
        pk = self.context.get('pk')
        user = request.user
        conversation = get_object_or_404(Conversation, pk=pk)

        return PinnedMessages.objects.create(
            message_id=validated_data['message_id'],
            pinned_by=user,
            conversation=conversation
        )

class PinnedMessagesSerializer(serializers.Serializer):
    conversation_id = serializers.IntegerField()
    message_id = serializers.IntegerField()
    is_pinned = serializers.BooleanField()
    
class ChangeNameConversationSerializer(serializers.Serializer):
    title = serializers.CharField()
    id = serializers.IntegerField()

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.save()
        return instance


