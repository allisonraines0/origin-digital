/** Shape returned by the API for an event, including derived registration info. */
export interface EventDto {
  id: number;
  title: string;
  description: string;
  /** ISO 8601 timestamp. */
  date: string;
  maxCapacity: number;
  registeredCount: number;
  availableSpots: number;
  isPastEvent: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  /** ISO 8601 timestamp. */
  date: string;
  maxCapacity: number;
}

/** Partial update — only include fields that should change. */
export type UpdateEventPayload = Partial<CreateEventPayload>;
