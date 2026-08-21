import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A horizontal fill gauge showing how full an event is. This is the one recurring
 * visual signature of the app — it appears on the list and detail views — and it's
 * built from real data (registeredCount / maxCapacity), not decoration.
 */
@Component({
  selector: 'app-capacity-gauge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gauge" [attr.aria-label]="label()" role="img">
      <div class="gauge-track">
        <div class="gauge-fill" [class]="'gauge-fill--' + status()" [style.width.%]="percent()"></div>
      </div>
      <span class="gauge-label mono">{{ registeredCount() }} / {{ maxCapacity() }}</span>
    </div>
  `,
  styles: [
    `
      .gauge {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .gauge-track {
        flex: 1;
        height: 8px;
        border-radius: 999px;
        background: var(--color-border);
        overflow: hidden;
        min-width: 80px;
      }

      .gauge-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.25s ease;
      }

      .gauge-fill--good {
        background: var(--color-good);
      }

      .gauge-fill--warn {
        background: var(--color-warn);
      }

      .gauge-fill--full {
        background: var(--color-danger);
      }

      .gauge-label {
        font-size: 0.8rem;
        color: var(--color-ink-soft);
        white-space: nowrap;
      }
    `,
  ],
})
export class CapacityGaugeComponent {
  readonly registeredCount = input.required<number>();
  readonly maxCapacity = input.required<number>();

  readonly percent = computed(() => {
    const max = this.maxCapacity();
    if (max <= 0) return 0;
    return Math.min(100, Math.round((this.registeredCount() / max) * 100));
  });

  readonly status = computed<'good' | 'warn' | 'full'>(() => {
    const pct = this.percent();
    if (pct >= 100) return 'full';
    if (pct >= 75) return 'warn';
    return 'good';
  });

  readonly label = computed(
    () => `${this.registeredCount()} of ${this.maxCapacity()} spots filled (${this.percent()}%)`
  );
}
