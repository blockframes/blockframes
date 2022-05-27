import type { EventService } from '@blockframes/event/service';

export function deleteEvent(id: string) {
  return cy.window().then(async w => {
    const eventService = w['EventService'] as EventService;
    await eventService.remove(id);
  });
}

export function deleteAllSellerEvents(sellerUid: string) {
  let uidArray: string[];
  return cy
    .task('getAllSellerEvents', sellerUid)
    .then((uids: string[]) => {
      uidArray = uids;
    })
    .window()
    .then(async w => {
      cy.log(`Deleting event ids: ${uidArray.toString()}`);
      const eventService = w['eventService'] as EventService;
      await eventService.remove(uidArray);
    });
}
