import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
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
    const t = localStorage.getItem(this.TOKEN_KEY);
    if (!t || t === 'undefined' || t === 'null') {
      return null;
    }
    return t;
  }

  getActiveBusinessId(): string | null {
    const id = this.activeBusiness()?.id || localStorage.getItem(this.ACTIVE_BIZ_KEY);
    if (!id || id === 'undefined' || id === 'null') {
      return 'b0000000-0000-0000-0000-000000000001';
    }
    return id;
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, req).pipe(
      map(res => res?.data || res),
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, req).pipe(
      map(res => res?.data || res),
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
    if (!biz || !biz.id) return;
    this.activeBusiness.set(biz);
    localStorage.setItem(this.ACTIVE_BIZ_KEY, biz.id);
  }

  switchBusiness(businessId: string): Observable<Business> {
    return this.http.post<any>(`${this.baseUrl}/businesses/${businessId}/switch`, {}).pipe(
      map(res => res?.data || res),
      tap(biz => {
        this.setActiveBusiness(biz);
      })
    );
  }

  updateOperatingMode(mode: string): Observable<Business> {
    const bizId = this.getActiveBusinessId();
    return this.http.post<any>(`${this.baseUrl}/businesses/${bizId}/mode`, { mode }).pipe(
      map(res => res?.data || res),
      tap(updated => {
        this.setActiveBusiness(updated);
        this.userBusinesses.update(list => list.map(b => b.id === updated.id ? updated : b));
      })
    );
  }

  refreshUserData(): Observable<User> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`).pipe(
      map(res => res?.data || res),
      tap(user => this.currentUser.set(user))
    );
  }

  refreshBusinesses(): Observable<Business[]> {
    return this.http.get<any>(`${this.baseUrl}/businesses`).pipe(
      map(res => res?.data || res || []),
      tap(businesses => {
        const list = Array.isArray(businesses) ? businesses : [];
        this.userBusinesses.set(list);
        if (list.length > 0) {
          const currentId = this.getActiveBusinessId();
          const match = list.find(b => b.id === currentId) || list[0];
          this.setActiveBusiness(match);
        }
      })
    );
  }

  private handleAuthSuccess(res: any): void {
    const data = res?.data || res;
    if (data?.accessToken) {
      localStorage.setItem(this.TOKEN_KEY, data.accessToken);
    }
    if (data?.refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, data.refreshToken);
    }
    if (data?.user) {
      this.currentUser.set(data.user);
    }
    const businesses = data?.businesses || [];
    this.userBusinesses.set(businesses);

    if (businesses.length > 0) {
      const active = businesses.find((b: any) => b.active) || businesses[0];
      this.setActiveBusiness(active);
    } else {
      // Default fallback workspace for demo
      this.setActiveBusiness({
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Gupta Kirana & General Store',
        tradeName: 'Gupta Traders',
        businessType: 'RETAIL_KIRANA',
        operatingMode: 'QUICK_START',
        currency: 'INR',
        active: true,
        role: 'OWNER'
      });
    }
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (!token) {
      this.autoDemoLogin();
      return;
    }

    this.refreshUserData().subscribe({
      next: () => {
        this.refreshBusinesses().subscribe();
      },
      error: () => {
        this.autoDemoLogin();
      }
    });
  }

  autoDemoLogin(): void {
    this.login({ email: 'harshal@marginos.internal', password: 'MarginOS@123' }).subscribe({
      error: (e) => console.warn('Auto demo authentication failed:', e)
    });
  }
}
