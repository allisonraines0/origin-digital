import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { RegistrationService } from '../../core/services/registration.service';
import { extractErrorMessage } from '../../core/services/error.util';
import { EventDto } from '../../core/models/event.model';
import { RegistrationDto } from '../../core/models/registration.model';
import { CapacityGaugeComponent } from '../../shared/components/capacity-gauge/capacity-gauge.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, CapacityGaugeComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
})
export class EventDetailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);

  readonly eventId = Number(this.route.snapshot.paramMap.get('id'));

  readonly event = signal<EventDto | null>(null);
  readonly registrations = signal<RegistrationDto[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly registering = signal(false);
  readonly registerError = signal<string | null>(null);
  readonly unregisteringUserId = signal<string | null>(null);
  readonly rowError = signal<string | null>(null);

  readonly registerForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.eventService.getById(this.eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.registrationService.list(this.eventId).subscribe({
          next: (registrations) => {
            this.registrations.set(registrations);
            this.loading.set(false);
          },
          error: (err) => {
            this.loadError.set(extractErrorMessage(err, 'Could not load registrations.'));
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.loadError.set(extractErrorMessage(err, 'Could not load this event.'));
        this.loading.set(false);
      },
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerError.set(null);
    this.registering.set(true);
    const { userId } = this.registerForm.getRawValue();

    this.registrationService.register(this.eventId, userId).subscribe({
      next: (registration) => {
        this.registrations.update((list) => [...list, registration]);
        this.event.update((e) =>
          e ? { ...e, registeredCount: e.registeredCount + 1, availableSpots: e.availableSpots - 1 } : e
        );
        this.registerForm.reset({ userId: '' });
        this.registering.set(false);
      },
      error: (err) => {
        this.registerError.set(extractErrorMessage(err, 'Could not register this user.'));
        this.registering.set(false);
      },
    });
  }

  unregister(registration: RegistrationDto): void {
    this.rowError.set(null);
    this.unregisteringUserId.set(registration.userId);

    this.registrationService.unregister(this.eventId, registration.userId).subscribe({
      next: () => {
        this.registrations.update((list) => list.filter((r) => r.id !== registration.id));
        this.event.update((e) =>
          e ? { ...e, registeredCount: e.registeredCount - 1, availableSpots: e.availableSpots + 1 } : e
        );
        this.unregisteringUserId.set(null);
      },
      error: (err) => {
        this.rowError.set(extractErrorMessage(err, 'Could not unregister this user.'));
        this.unregisteringUserId.set(null);
      },
    });
  }
}
