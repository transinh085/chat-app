from django.urls import path
from .views import RegisterUserView, VerifyUserEmail, LoginUserView, LogoutView, PasswordResetRequestView, PasswordResetConfirm, SetNewPasswordView, GetAuthenticatedReqView, GetInforUserView, GoogleOauthSignInview, GithubOauthSignInView, CheckTokenView, ChangePasswordWithTokenView
from rest_framework_simplejwt.views import (TokenRefreshView)

from django.urls import path
from .views import RegisterUserView, VerifyUserEmail, LoginUserView, LogoutView, PasswordResetRequestView, PasswordResetConfirm, SetNewPasswordView, GetAuthenticatedReqView, GetInforUserView, ForgotPasswordView
from rest_framework_simplejwt.views import (TokenRefreshView)

urlpatterns = [
    path('register', RegisterUserView.as_view(), name='register'),
    path('verify-email', VerifyUserEmail.as_view(), name='verify'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('login', LoginUserView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('password-reset', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>', PasswordResetConfirm.as_view(), name='reset-password-confirm'),
    path('set-new-password', SetNewPasswordView.as_view(), name='set-new-password'),
    path('get-something', GetAuthenticatedReqView.as_view(), name='get-something'),
    path('get-info-user', GetInforUserView.as_view(), name='get-info-user'),
    path('google/', GoogleOauthSignInview.as_view(), name='google'),
    path('github/', GithubOauthSignInView.as_view(), name='github'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('check-token/', CheckTokenView.as_view(), name='check-token'),
    path('change-password/', ChangePasswordWithTokenView.as_view(), name='change-password')
]