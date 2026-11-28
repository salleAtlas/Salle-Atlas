import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  client: Client;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  client: Client;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly CLIENT_KEY = 'auth_client';

  readonly currentUser = signal<Client | null>(this.getStoredClient());
  readonly token = signal<string | null>(this.getToken());
  readonly isAuthenticated = computed(() => !!this.token());

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.setSession(res.token, res.client);
      })
    );
  }

  getMe(): Observable<{ client: Client }> {
    return this.http.get<{ client: Client }>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        this.currentUser.set(res.client);
        this.saveStoredClient(res.client);
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.CLIENT_KEY);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setSession(token: string, client: Client): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
      this.saveStoredClient(client);
    }
    this.token.set(token);
    this.currentUser.set(client);
  }

  private getStoredClient(): Client | null {
    if (this.isBrowser()) {
      const raw = localStorage.getItem(this.CLIENT_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as Client;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private saveStoredClient(client: Client): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.CLIENT_KEY, JSON.stringify(client));
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
