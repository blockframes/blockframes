import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ImportModule } from './import.module';

describe('ImportModule', () => {

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule,
        ImportModule
      ],
    });
  });

  it.skip('should create', () => {
    expect(ImportModule).toBeDefined();
  });
});
