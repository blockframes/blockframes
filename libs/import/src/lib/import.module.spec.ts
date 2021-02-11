import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { ImportModule } from './import.module';

describe('ImportModule', () => {
  let db: AngularFirestore;
  let storage: AngularFireStorage;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp({projectId: 'test'}),
        AngularFirestoreModule,
        ImportModule
      ],
    });
    db = TestBed.inject(AngularFirestore);
    storage = TestBed.inject(AngularFireStorage);
  });

  it.skip('should create', () => {
    expect(ImportModule).toBeDefined();
  });
});
