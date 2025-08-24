import { getUser } from '@/api/auth.api';
import useUserStore from '@/stores/useUserStore';

class AuthManager {
  private static instance: AuthManager;
  private isCurrentlyFetching = false;
  private fetchPromise: Promise<any> | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async ensureAuthenticated(): Promise<any> {
    const { user, shouldRefetchUser, setLoading } = useUserStore.getState();
    
    // If we have valid cached user data, return it
    if (user && !shouldRefetchUser()) {
      return user;
    }

    // If we're already fetching, return the existing promise
    if (this.isCurrentlyFetching && this.fetchPromise) {
      return this.fetchPromise;
    }

    // Start fetching user data
    this.isCurrentlyFetching = true;
    setLoading(true);

    this.fetchPromise = (async () => {
      try {
        const userData = await getUser();
        return userData;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
      } finally {
        this.isCurrentlyFetching = false;
        this.fetchPromise = null;
        setLoading(false);
      }
    })();

    return this.fetchPromise;
  }

  clearAuthCache() {
    this.isCurrentlyFetching = false;
    this.fetchPromise = null;
    useUserStore.getState().clearUser();
  }
}

export const authManager = AuthManager.getInstance();
