from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from .serializers import ChangeNameConversationSerializer, PinnedMessagesSerializer,PinnedMessagesCreateSerializer, AttachmentSerializer,MemberConversationSerializer, ParticipantDetailSerializer,DeleteMessageSerializer, ConversationSerializer, CreateParticipantsSerializer,MessageSerializer, PinConversationSerializer, CloseConversationSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Participants, Message, DeleteMessage, PinConversation, Attachments, PinnedMessages, OnlineUser
from django.http import Http404
from django.db.models import Max
from config.paginations import CustomPagination
from django.db.models import Max
from utils.responses import SuccessResponse, ErrorResponse
from authentication.models import User
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone


def send_message_to_conversation_members(conversation_id, type, data):
    channel_layer = get_channel_layer()
    users = User.objects.filter(participants__conversation_id=conversation_id)
    for user in users:
        room_group_name = f"user_{user.id}"
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': type,
                'message': data
            }
        )

class ConversationList(APIView):
    serializer_class = ConversationSerializer
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(participants__user=request.user, message__isnull=False).annotate(
            latest_message_time=Max('message__created_at')
        ).order_by('-latest_message_time')

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(conversations, request)
        serializer = self.serializer_class(result_page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    # Tạo cuộc hội thoại
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            conversation = Conversation.objects.get(id=serializer.data['id'])
            sender = self.request.user
            Message.objects.create(
                conversation=conversation,
                sender=sender,
                message=f"{sender.first_name} {sender.last_name} đã tạo ra group này!",
                message_type=Message.MessageType.NEWS
            )
            serializer = self.serializer_class(conversation, many=False, context={'request': request})
            send_message_to_conversation_members(conversation.id, 'add_group', serializer.data)
            return SuccessResponse(data=serializer.data, status=status.HTTP_201_CREATED)  
        return ErrorResponse(error_message=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class DeleteMember(APIView):
    # Delete member from conversation
    def delete(self, request, conversation_id, user_id, format=None):
        # send message to conversation members
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message=f"{request.user.last_name} đã xóa {User.objects.get(id=user_id).last_name} khỏi nhóm!",
            message_type=Message.MessageType.NEWS
        )
        message_serializer = MessageSerializer(instance=message)
        
        send_message_to_conversation_members(
            conversation.id,
            'delete_member', 
            {
                "conversation_id": conversation_id,
                "user_id": user_id,
            })
        
        send_message_to_conversation_members(conversation.id, 'chat_message', message_serializer.data)
        
        # delete participant
        participant = Participants.objects.filter(conversation__id=conversation_id, user__id=user_id)
        participant.delete()
        
        return SuccessResponse(data={
            "conversation_id": conversation_id,
            "user_id": user_id,
            "message": 'Member deleted successfully.'
            }, status=status.HTTP_200_OK)
    
class GetMemberConversation(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateParticipantsSerializer
    def get(self, request, pk, format=None):
        conversation = Conversation.objects.get(pk=pk)
        participants = Participants.objects.filter(conversation=conversation)
        users = [participant.user for participant in participants]
        serializer = MemberConversationSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk, format=None):
        serializer = self.serializer_class(data={
            'conversation_id': pk,
            'users': request.data.get('users'),
        })
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            conversation = Conversation.objects.get(id=pk)

            for userId in request.data.get('users'):
                findUser = User.objects.get(id=userId)
                message = Message.objects.create(
                    conversation=conversation,
                    sender=request.user,
                    message=f"{request.user.last_name} đã thêm {findUser.first_name} {findUser.last_name} vào nhóm!",
                    message_type=Message.MessageType.NEWS
                )
                message_serializer = MessageSerializer(instance=message)
                send_message_to_conversation_members(conversation.id, 'chat_message', message_serializer.data)

            sendGroup = ConversationSerializer(conversation, context={'request': request})
            send_message_to_conversation_members(conversation.id, 'add_group', sendGroup.data)
            return SuccessResponse("Add successfully!", status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  

class GetMessagesConversation(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = MessageSerializer

    def get_queryset(self, request):
        pk = self.kwargs.get('pk')
        participant = Participants.objects.filter(conversation_id=pk, user_id=self.request.user.id).first()
        if participant:
            messages = Message.objects.filter(conversation=pk).exclude(deletemessage__user=request.user).order_by('-created_at')
            return messages
        else:
            return Message.objects.none()  # Return an empty queryset if the user doesn't have access

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(request)
        page = self.paginate_queryset(queryset)[::-1]
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class MesssageDetail(generics.DestroyAPIView):
    def get_object(self, pk):
        try:
            return Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            raise Http404 
        
    # Delete message
    def delete(self, request, pk, format=None):
        message = self.get_object(pk)
        delete_message = DeleteMessage.objects.create(message=message,user=request.user)
        serializer = DeleteMessageSerializer(delete_message)
        return SuccessResponse(data=serializer.data)
    
    # Recall message
    def put(self, request, pk, format=None):
        message_obj = self.get_object(pk)
        if request.user != message_obj.sender:
            return ErrorResponse(error_message="You are not the sender of this message")
        message_obj.message_type = Message.MessageType.RECALL
        message_obj.message = ""
        message_obj.save()
        serializer = MessageSerializer(message_obj)
        send_message_to_conversation_members(message_obj.conversation_id, 'recall_message', serializer.data)
        return SuccessResponse(data=serializer.data)
    
class ConversationListFind(APIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        search_query = request.GET.get('query')
        conversations = Conversation.objects.filter(participants__user=request.user)
        
        conversations = conversations.annotate(
            latest_message_time=Max('message__created_at')
        ).order_by('-latest_message_time')

        conversation_data = []
        for conversation in conversations:
            users = User.objects.filter(participants__conversation=conversation)
            conversation_info = {
                'id': conversation.id, 
                'title': conversation.title, 
                'members': users
            }
            def check_query(x):
                search_query_lower = search_query.lower()
                v = filter(lambda x: search_query_lower in x, map(lambda x: f'{x.first_name} {x.last_name}'.lower(), x.get('members')))
                return search_query_lower in x.get('title') or len(list(v)) > 0
            
            if not search_query or check_query(conversation_info):
                conversation_data.append(conversation)
                
        serializer = self.serializer_class(conversation_data, many=True, context={'request': request})
        return SuccessResponse(data=serializer.data)

class PinConversationUser(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PinConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation_id = serializer.validated_data['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        check_pin = PinConversation.objects.filter(conversation=conversation, user=request.user).exists()
        if check_pin: 
            return ErrorResponse(error_message="You have already pinned this conversation", status=status.HTTP_400_BAD_REQUEST)
        pin_conversation = PinConversation.objects.create(
            user=request.user,
            conversation=conversation
        )
        serializer = PinConversationSerializer(pin_conversation)
        return SuccessResponse(data=serializer.data, status=status.HTTP_201_CREATED)

class UnpinConversationUser(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PinConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation_id = serializer.validated_data['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        try:
            pinned_conversation = PinConversation.objects.get(conversation=conversation, user=request.user)
        except PinConversation.DoesNotExist:
            return ErrorResponse(error_message="You have not pinned this conversation", status=status.HTTP_400_BAD_REQUEST)
        pinned_conversation.delete()
        return SuccessResponse(data={"conversation_id": conversation_id}, status=status.HTTP_200_OK)

class LeaveConversation(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CloseConversationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        conversation_id = serializer.validated_data['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        try:
            send_message_to_conversation_members(conversation.id,
                'delete_member', 
                {
                    "conversation_id": conversation_id,
                    "user_id": user.id,
                })
            participant = Participants.objects.get(conversation_id=conversation_id, user=user)
            participant.delete()
            message = Message.objects.create(
                    conversation=conversation,
                    sender=user,
                    message=f'{user.first_name} {user.last_name} left the conversation',
                    message_type=Message.MessageType.NEWS
                )
            message_serializer = MessageSerializer(instance=message)
            send_message_to_conversation_members(message.conversation_id, 'chat_message', message_serializer.data)
        except Participants.DoesNotExist:
            return ErrorResponse(error_message="Conversation does not exist for this user", status=status.HTTP_400_BAD_REQUEST)
        return SuccessResponse(data={"conversation_id": conversation_id}, status=status.HTTP_200_OK)
        
class GetAttachmentConversation(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination  

    def get_queryset(self):
        pk = self.kwargs.get('pk')
        message_type = self.request.query_params.get('type')
        queryset = Attachments.objects.filter(message__conversation_id=pk)
        queryset = queryset.exclude(message__deletemessage__user=self.request.user)
        if message_type:
            queryset = queryset.filter(message__message_type=message_type)
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # page = self.paginate_queryset(queryset)[::-1]
        # if page is not None:
        #     serializer = AttachmentSerializer(page, many=True)
        #     return self.get_paginated_response(serializer.data)
        serializer = AttachmentSerializer(queryset, many=True)
        return Response(serializer.data)
    
    
    
class PinnedMessagesList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = MessageSerializer

    def get_queryset(self, request):
        pk = self.kwargs.get('pk')
        participant = Participants.objects.filter(conversation_id=pk, user_id=self.request.user.id).first()
        if participant:
            messages = Message.objects.filter(pinnedmessages__conversation_id=pk).exclude(deletemessage__user=request.user).exclude(message_type=Message.MessageType.RECALL).order_by('-created_at')
            return messages
        else:
            return Message.objects.none()  # Return an empty queryset if the user doesn't have access

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(request)
        
        # page = self.paginate_queryset(queryset)[::-1]
        # if page is not None:
        #     serializer = self.get_serializer(page, many=True)
        #     return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset[::-1], many=True)
        return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        conversation_id = kwargs.get('pk')
        message_id = request.data.get('message_id')
        serializer = PinnedMessagesCreateSerializer(data={'message_id': message_id}, context={'request': request, 'pk': conversation_id})
        if serializer.is_valid():
            pinned_message = serializer.save()
            message = Message.objects.create(
                    conversation=pinned_message.conversation,
                    sender=request.user,
                    message=f'{request.user.get_full_name} pinned a message.',
                    message_type=Message.MessageType.NEWS
            )
            message_serializer = MessageSerializer(instance=message)
            message_pinned = PinnedMessagesSerializer(instance={
                'conversation_id': conversation_id, 
                'message_id': message_id,
                'is_pinned': True
            })
            send_message_to_conversation_members(message.conversation.id, 'chat_message', message_serializer.data)
            send_message_to_conversation_members(message.conversation.id, 'pin_message', message_pinned.data)
            return SuccessResponse(data={"message_id": pinned_message.message.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeletePinnedMessage(APIView):
    def get_object(self, pk, message_id):
        try:
            return PinnedMessages.objects.filter(message_id=message_id, conversation_id=pk).first()
        except PinnedMessages.DoesNotExist:
            raise Http404

    def delete(self, request, pk, message_id, format=None):
        pinned_message = self.get_object(pk, message_id)
        if pinned_message is not None:
            pinned_message.delete()
            message = Message.objects.create(
                    conversation=pinned_message.conversation,
                    sender=request.user,
                    message=f'{request.user.get_full_name} unpinned a message.',
                    message_type=Message.MessageType.NEWS
            )
            message_serializer = MessageSerializer(instance=message)
            message_pinned = PinnedMessagesSerializer(instance={
                'conversation_id': pk, 
                'message_id': message_id,
                'is_pinned': False
            })
            send_message_to_conversation_members(message.conversation.id, 'chat_message', message_serializer.data)
            send_message_to_conversation_members(message.conversation.id, 'pin_message', message_pinned.data)
            return SuccessResponse(data={"message_id": message_id}, status=status.HTTP_200_OK)
        else:
            raise Http404

class ChangeNameConversation(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeNameConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        conversation_id = serializer.validated_data['id']
        title = serializer.validated_data['title']

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return ErrorResponse(error_message="Conversation does not exist", status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is a participant in the conversation
        if not Participants.objects.filter(conversation=conversation, user=user).exists():
            return ErrorResponse(error_message="User is not a participant in this conversation", status=status.HTTP_400_BAD_REQUEST)

        # Update the conversation's title
        conversation.title = title
        conversation.save()

        message = Message.objects.create(
                    conversation=conversation,
                    sender=user,
                    message=f'{user.first_name} {user.last_name} rename to {conversation.title}',
                    message_type=Message.MessageType.NEWS
                )
        message_serializer = MessageSerializer(instance=message)
        send_message_to_conversation_members(message.conversation_id, 'change_name_conversation', {
            "message": message_serializer.data,
            "title": title,
            "id": conversation_id
        })

        return SuccessResponse(data={
            "message": message_serializer.data,
            "title": title,
            "id": conversation_id
        }, status=status.HTTP_200_OK)


class GetListConversationTypeGroup(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get(self, request):
        conversations = Conversation.objects.filter(participants__user=request.user, message__isnull=False, type=Conversation.ConversationType.GROUP).annotate(
            latest_message_time=Max('message__created_at')
        ).order_by('-latest_message_time')
        serializer = self.serializer_class(conversations, many=True, context={'request': request})
        return SuccessResponse(data=serializer.data, status=status.HTTP_200_OK)

class GetConversationFromUserId(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get(self, request, user_id):
        conversation = Conversation.objects.filter(
            participants__user=user_id,
            participants__conversation__type=Conversation.ConversationType.FRIEND,
            participants__conversation__participants__user=request.user).first()
        if not conversation:
            conversation = Conversation.objects.create(type=Conversation.ConversationType.FRIEND)
            Participants.objects.create(conversation=conversation, user=request.user)
            Participants.objects.create(conversation=conversation, user=User.objects.get(id=user_id))
            
        serializer = self.serializer_class(conversation, context={'request': request})
        return SuccessResponse(data=serializer.data, status=status.HTTP_201_CREATED)