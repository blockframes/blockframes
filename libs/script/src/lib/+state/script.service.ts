import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { AngularFirestore } from '@angular/fire/firestore';
import { ScriptStore } from './script.store';
import { Script, createScript } from './script.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ScriptService {
  private readonly collection = 'scripts';

  constructor(
    private firestore: AngularFirestore,
    private store: ScriptStore
  ) {
    /*
    this.firestore.collection<Script>(this.collection)
      .valueChanges()
      .pipe(tap(scripts => this.store.set(scripts)));
    */
  }

  public add(script: Script) {
    // this.firestore.collection(this.collection).add(script);
    this.store.add(createScript(script));
  }

  public update(id, script: Partial<Script>) {
    this.store.update(id, script);
  }

  public remove(id: ID) {
    this.store.remove(id);
  }
}
