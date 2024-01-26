from django.urls import path

from chat_app.views.auth_view import *
from rest_framework.authtoken import views

from chat_app.views.call_view import StartCall, EndCall
from chat_app.views.message_view import MessageView
# group api
from chat_app.views.group_view import CreateGroup, GetAllGroups
from config import settings

urlpatterns = [
    path('api-token-auth/', views.obtain_auth_token),
    path('login/', Login.as_view()),
    path('registration/', RegisterView.as_view()),
    path('logout/', LogOutView.as_view()),
    path('users/', UsersView.as_view()),
    path('message/', MessageView.as_view()),
    path('start-call/', StartCall.as_view()),
    path('end-call/', EndCall.as_view()),

    # group api here
    path('groups/<int:user_id>', GetAllGroups.as_view()),
    path('groups/create-group', CreateGroup.as_view()),


    # socket here
    path('test-socket/', test_socket)
]
