import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { extractErrorMessage } from '../../core/services/error.util';

/** Converts an ISO date string to the value a <input type="datetime-local"> expects. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css',
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly eventId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly isEditMode = () => this.eventId() !== null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    date: ['', [Validators.required]],
    maxCapacity: [50, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.eventId.set(id);
      this.loading.set(true);
      this.eventService.getById(id).subscribe({
        next: (event) => {
          this.form.patchValue({
            title: event.title,
            description: event.description,
            date: toLocalInputValue(event.date),
            maxCapacity: event.maxCapacity,
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'Could not load this event.'));
          this.loading.set(false);
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.saving.set(true);
    const { title, description, date, maxCapacity } = this.form.getRawValue();
    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      maxCapacity: Number(maxCapacity),
    };

    const id = this.eventId();
    const request = id ? this.eventService.update(id, payload) : this.eventService.create(payload);

    request.subscribe({
      next: (event) => {
        this.saving.set(false);
        this.router.navigate(['/events', event.id]);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'Could not save this event.'));
        this.saving.set(false);
      },
    });
  }
}
