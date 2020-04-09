// jest.mock('@angular/fire/firestore')
// jest.mock('@angular/fire/functions');

import { EventService } from "./event.service"
import { EventStore } from "./event.store";
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { of } from "rxjs";
import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';

describe('Event Service Spectator', () => {
  let spectator: SpectatorService<EventService>;
  const createService = createServiceFactory({
    service: EventService,
    providers: [EventStore, mockProvider(AngularFireFunctions, {
      httpsCallable: jest.fn(() => () => of(true))
    })],
    mocks: [AngularFirestore]
  });

  beforeEach(() => spectator = createService());
  it('Should call function', async () => {
    const functions = spectator.get(AngularFireFunctions);
    const service = spectator.service;
    const result = await service.setEventUrl('id');
    expect(functions.httpsCallable).toHaveBeenCalledWith('setEventUrl');
    expect(result).toBeTruthy();
  })
});

// describe('Event Service', () => {
//   let service: EventService;
//   let functions: AngularFireFunctions;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [EventService, EventStore, AngularFirestore, AngularFireFunctions],
//     });
//     service = TestBed.inject(EventService);
//     functions = TestBed.inject(AngularFireFunctions);
//   })

//   it('Should exist', () => expect(service).toBeDefined())

//   it('Should call function', async () => {
//     // functions['httpsCallable' as any] = jest.fn(() => () => ({ toPromise: () => Promise.resolve(true) }));
//     const result = await service.setEventUrl('id');
//     expect(result).toBeTruthy();
//     expect(functions.httpsCallable).toHaveBeenCalledWith('setEventUrl');
//   })
// })

