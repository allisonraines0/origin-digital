import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistrationDto } from '../models/registration.model';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/events`;

  list(eventId: number): Observable<RegistrationDto[]> {
    return this.http.get<RegistrationDto[]>(`${this.baseUrl}/${eventId}/registrations`);
  }

  register(eventId: number, userId: string): Observable<RegistrationDto> {
    return this.http.post<RegistrationDto>(`${this.baseUrl}/${eventId}/registrations`, { userId });
  }

  unregister(eventId: number, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${eventId}/registrations/${encodeURIComponent(userId)}`);
  }
}
