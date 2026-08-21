import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { extractErrorMessage } from '../../core/services/error.util';
import { EventDto } from '../../core/models/event.model';
import { CapacityGaugeComponent } from '../../shared/components/capacity-gauge/capacity-gauge.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, CapacityGaugeComponent],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent {
  private readonly eventService = inject(EventService);

  readonly events = signal<EventDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'Could not load events.'));
        this.loading.set(false);
      },
    });
  }

  deleteEvent(event: EventDto): void {
    const confirmed = confirm(`Delete "${event.title}"? This cannot be undone.`);
    if (!confirmed) return;

    this.deletingId.set(event.id);
    this.eventService.delete(event.id).subscribe({
      next: () => {
        this.events.update((list) => list.filter((e) => e.id !== event.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'Could not delete this event.'));
        this.deletingId.set(null);
      },
    });
  }
}
