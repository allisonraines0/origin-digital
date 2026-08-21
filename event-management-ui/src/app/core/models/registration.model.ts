export interface RegistrationDto {
  id: number;
  eventId: number;
  userId: string;
  /** ISO 8601 timestamp. */
  registeredAt: string;
}

/** Shape of the JSON body the API returns on 4xx/5xx responses. */
export interface ApiErrorBody {
  error: string;
  message: string;
  statusCode: number;
}
