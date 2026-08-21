import { Routes } from '@angular/router';
import { EventListComponent } from './features/event-list/event-list.component';
import { EventFormComponent } from './features/event-form/event-form.component';
import { EventDetailComponent } from './features/event-detail/event-detail.component';

export const routes: Routes = [
  { path: '', component: EventListComponent, title: 'All events · Registration Desk' },
  { path: 'events/new', component: EventFormComponent, title: 'New event · Registration Desk' },
  { path: 'events/:id/edit', component: EventFormComponent, title: 'Edit event · Registration Desk' },
  { path: 'events/:id', component: EventDetailComponent, title: 'Event · Registration Desk' },
  { path: '**', redirectTo: '' },
];
