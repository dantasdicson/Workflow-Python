from django.conf import settings
from django.shortcuts import redirect

def home(request):
    return redirect(getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000'))
