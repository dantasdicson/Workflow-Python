from django.conf import settings
from django.shortcuts import redirect, render


def _is_local_frontend_url(url):
    return url.startswith('http://localhost') or url.startswith('http://127.0.0.1')


def home(request):
    frontend_url = getattr(settings, 'FRONTEND_BASE_URL', '')

    if frontend_url and not _is_local_frontend_url(frontend_url):
        return redirect(frontend_url)

    return render(request, 'index.html')
