import { EventService } from './event.service';
import { EventStore } from './event.store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';

describe('Event Service', () => {
  let spectator: SpectatorService<EventService>;
  const createService = createServiceFactory({
    service: EventService,
    providers: [EventStore, mockProvider(AngularFireFunctions, {
      httpsCallable: jest.fn(() => () => of(true))
    })],
    mocks: [AngularFirestore]
  });

  beforeEach(() => spectator = createService());
  
  test('Exists', () => {
    expect(spectator.service).toBeDefined();
  })
  test('formatToFirestore', () => {
    const e = {
      title: 'fake',
      draggable: true,
      resizable: false,
      color: 'blue',
    };
    const event = spectator.service.formatToFirestore(e as any);
    expect(event.draggable).toBeUndefined();
    expect(event.resizable).toBeUndefined();
    expect(event.color).toBeUndefined();
    expect(event.title).toBe('fake');
  })
  test('setEventUrl', async () => {
    const functions = spectator.get(AngularFireFunctions);
    const result = await spectator.service.setEventUrl('id');
    expect(functions.httpsCallable).toHaveBeenCalledWith('setEventUrl');
    expect(result).toBeTruthy();
  })
})

