import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  };
}

export interface LoginRequest {
  nombre?: string;
  correo?: string;
  contrasena: string;
}

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Si el campo parece un correo, envíalo como correo, si no como nombre
    const loginPayload: any = { contrasena: credentials.contrasena };
    if (credentials.correo) {
      loginPayload.correo = credentials.correo;
    } else if (credentials.nombre) {
      loginPayload.nombre = credentials.nombre;
    }
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginPayload).pipe(
      tap((response) => {
        // Forzar rol a mayúsculas en el frontend
        response.user.rol = response.user.rol?.toUpperCase();
        this.setSession(response);
      }),
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.userSubject.next(null);
  }

  private setSession(response: LoginResponse): void {
    sessionStorage.setItem('token', response.access_token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private loadUserFromSession(): void {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Error loading user from session', e);
      }
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  hasRole(role: string): boolean {
    return (this.userSubject.value?.rol === role.toUpperCase()) || false;
  }
}
