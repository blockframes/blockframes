import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator/jest';
import { MediaService } from './media.service';
import { MediaStore } from './media.store';
import { MediaQuery } from './media.query';
import { AngularFireStorage } from '@angular/fire/storage';
import { Overlay } from '@angular/cdk/overlay';


// this.overlay.position().global().bottom('16px').left('16px')

describe('Media Service', () => {

  let spectator: SpectatorService<MediaService>;

  const createService = createServiceFactory({
    service: MediaService,
    providers: [mockProvider(Overlay, {
      position: () => {
        return {
          global: () => {
            return {
              bottom: () => {
                return {
                  left: () => true
                }
              }
            }
          }
        }
      }
    })],
    mocks: [MediaStore, MediaQuery, AngularFireStorage]
  });


  beforeEach(() => spectator = createService());


  test('Exists', () => {
    expect(spectator.service).toBeDefined();
  })
});