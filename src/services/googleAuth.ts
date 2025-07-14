import { jwtDecode } from 'jwt-decode';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
  phoneNumber?: string;
}

interface GoogleCredential {
  credential: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private user: GoogleUser | null = null;
  private onAuthStateChange: ((user: GoogleUser | null) => void) | null = null;
  private accessToken: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  public async initialize(clientId: string): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        this.isInitialized = true;
        resolve();
      };
      
      document.head.appendChild(script);
    });
  }

  // New: OAuth 2.0 popup flow to get access token
  public async getAccessToken(clientId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}` +
          `&redirect_uri=${window.location.origin}` +
          `&response_type=token` +
          `&scope=profile%20email%20https://www.googleapis.com/auth/user.phonenumbers.read` +
          `&include_granted_scopes=true`,
        'google_oauth_popup',
        'width=500,height=600'
      );
      if (!popup) return reject('Popup blocked');
      const interval = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(interval);
            reject('Popup closed');
            return;
          }
          const hash = popup.location.hash;
          if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
              this.accessToken = accessToken;
              clearInterval(interval);
              popup.close();
              resolve(accessToken);
            }
          }
        } catch (e) {}
      }, 500);
    });
  }

  // New: Fetch phone number from Google People API
  public async fetchPhoneNumber(clientId: string): Promise<string | undefined> {
    let accessToken = this.accessToken;
    if (!accessToken) {
      accessToken = await this.getAccessToken(clientId);
    }
    if (!accessToken) return undefined;
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) return undefined;
    const data = await response.json();
    return data.phoneNumbers?.[0]?.value;
  }

  // Update handleCredentialResponse to optionally fetch phone number
  private async handleCredentialResponse(response: GoogleCredential): Promise<void> {
    try {
      const decoded = jwtDecode<GoogleUser>(response.credential);
      let phoneNumber: string | undefined = undefined;
      // Try to fetch phone number (optional, may require user consent)
      try {
        phoneNumber = await this.fetchPhoneNumber('844002845433-04e9jb4i8hu404usig2sm4hnqt18skml.apps.googleusercontent.com');
      } catch (e) {
        phoneNumber = undefined;
      }
      this.user = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
        phoneNumber,
      };
      // Store in localStorage for persistence
      localStorage.setItem('googleUser', JSON.stringify(this.user));
      if (this.onAuthStateChange) {
        this.onAuthStateChange(this.user);
      }
    } catch (error) {
      console.error('Error decoding credential:', error);
    }
  }

  public renderSignInButton(element: HTMLElement): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'sign_in_with',
      shape: 'rectangular',
    });
  }

  public signOut(): void {
    this.user = null;
    localStorage.removeItem('googleUser');
    if (this.onAuthStateChange) {
      this.onAuthStateChange(null);
    }
  }

  public getCurrentUser(): GoogleUser | null {
    if (!this.user) {
      // Try to restore from localStorage
      const stored = localStorage.getItem('googleUser');
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('googleUser');
        }
      }
    }
    return this.user;
  }

  public onAuthStateChanged(callback: (user: GoogleUser | null) => void): void {
    this.onAuthStateChange = callback;
    // Immediately call with current user
    callback(this.getCurrentUser());
  }

  public getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  }

  public getUserPhoneNumber(): string | null {
    const user = this.getCurrentUser();
    return user && user.phoneNumber ? user.phoneNumber : null;
  }
}