import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEventPayload, EventDto, UpdateEventPayload } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/events`;

  getAll(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateEventPayload): Observable<EventDto> {
    return this.http.post<EventDto>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateEventPayload): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
