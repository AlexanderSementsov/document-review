import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginReqDto } from '../../shared/interfaces/user/login-req.dto';
import { Observable } from 'rxjs';
import { LoginResDto } from '../../shared/interfaces/user/login-res.dto';
import { BACKEND_URL } from '../../shared/tokens/backend-url.token';
import { UserResDto } from '../../shared/interfaces/user/user-res.dto';
import { CreateUserDto } from '../../shared/interfaces/user/create-user.dto';

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(BACKEND_URL);

  login(payload: LoginReqDto): Observable<LoginResDto> {
    return this.http.post<LoginResDto>(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: CreateUserDto): Observable<UserResDto> {
    return this.http.post<UserResDto>(`${this.baseUrl}/user/register`, payload);
  }

  getCurrentUser(): Observable<UserResDto> {
    return this.http.get<UserResDto>(`${this.baseUrl}/user`);
  }
}
