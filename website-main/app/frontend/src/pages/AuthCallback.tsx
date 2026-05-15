import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authReturnToStorage, authTokenStorage } from '@/lib/auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = searchParams.get('token') || hashParams.get('token');
    if (!token) {
      navigate('/auth/error?msg=Missing authentication token', { replace: true });
      return;
    }

    authTokenStorage.set(token);
    const returnTo = authReturnToStorage.get() || '/';
    authReturnToStorage.clear();
    navigate(returnTo, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
