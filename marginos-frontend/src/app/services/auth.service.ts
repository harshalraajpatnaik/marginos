import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Business, User, LoginRequest, RegisterRequest } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = '/api/v1';
  private readonly TOKEN_KEY = 'marginos_access_token';
  private readonly REFRESH_KEY = 'marginos_refresh_token';
  private readonly ACTIVE_BIZ_KEY = 'marginos_active_biz';

  // Reactive state signals
  currentUser = signal<User | null>(null);
  activeBusiness = signal<Business | null>(null);
  userBusinesses = signal<Business[]>([]);
  isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getActiveBusinessId(): string | null {
    return this.activeBusiness()?.id || localStorage.getItem(this.ACTIVE_BIZ_KEY);
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, req).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, req).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ACTIVE_BIZ_KEY);
    this.currentUser.set(null);
    this.activeBusiness.set(null);
    this.userBusinesses.set([]);
    this.router.navigate(['/login']);
  }

  setActiveBusiness(biz: Business): void {
    this.activeBusiness.set(biz);
    localStorage.setItem(this.ACTIVE_BIZ_KEY, biz.id);
  }

  switchBusiness(businessId: string): Observable<Business> {
    return this.http.post<Business>(`${this.baseUrl}/businesses/${businessId}/switch`, {}).pipe(
      tap(biz => {
        this.setActiveBusiness(biz);
      })
    );
  }

  updateOperatingMode(mode: string): Observable<Business> {
    const bizId = this.getActiveBusinessId();
    return this.http.post<Business>(`${this.baseUrl}/businesses/${bizId}/mode`, { mode }).pipe(
      tap(updated => {
        this.setActiveBusiness(updated);
        this.userBusinesses.update(list => list.map(b => b.id === updated.id ? updated : b));
      })
    );
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  refreshBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.baseUrl}/businesses`).pipe(
      tap(businesses => {
        this.userBusinesses.set(businesses);
        if (businesses.length > 0) {
          const currentId = this.getActiveBusinessId();
          const match = businesses.find(b => b.id === currentId) || businesses[0];
          this.setActiveBusiness(match);
        }
      })
    );
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    }
    this.currentUser.set(res.user);
    this.userBusinesses.set(res.businesses || []);

    if (res.businesses && res.businesses.length > 0) {
      const active = res.businesses.find(b => b.active) || res.businesses[0];
      this.setActiveBusiness(active);
    }
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (!token) return;

    this.refreshUserData().subscribe({
      next: () => {
        this.refreshBusinesses().subscribe();
      },
      error: () => {
        this.logout();
      }
    });
  }
}
