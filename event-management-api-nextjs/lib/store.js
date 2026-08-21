import { EventRepository } from './repositories/eventRepository';
import { RegistrationRepository } from './repositories/registrationRepository';
import { EventService } from './services/eventService';
import { RegistrationService } from './services/registrationService';

// In dev mode, Next.js hot-reloads route/module code on every save, which would
// normally re-run this module and wipe the in-memory data. Stashing the singletons
// on `globalThis` makes them survive HMR, so data persists across edits during
// `next dev` the same way it would across requests in production.
const globalStore = globalThis;

if (!globalStore.__eventManagementApiStore) {
  const eventRepository = new EventRepository();
  const registrationRepository = new RegistrationRepository();

  globalStore.__eventManagementApiStore = {
    eventRepository,
    registrationRepository,
    eventService: new EventService(eventRepository, registrationRepository),
    registrationService: new RegistrationService(eventRepository, registrationRepository),
  };
}

const store = globalStore.__eventManagementApiStore;

export const { eventRepository, registrationRepository, eventService, registrationService } = store;
export default store;
