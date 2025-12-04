from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.HealthCheckView.as_view(), name='health_check'),
    path('analyze/', views.AnalyzeImageView.as_view(), name='analyze_image'),
    path('transcribe/', views.TranscribeAudioView.as_view(), name='transcribe_audio'),
]