import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function createOrg(org: any) {
  return {
    poster: 'posters',
    ...org,
  };
}


@Component({
  selector: 'cropper-page',
  templateUrl: './cropper-page.component.html'
})
export class CropperPageComponent implements OnInit {
  path$: Observable<string>;
  constructor(private db: AngularFirestore) {}

  ngOnInit() {
    this.path$ = this.db.doc('orgs/org1').valueChanges().pipe(
      map(org => createOrg(org).poster),
    );
  }

  save(path: string) {
    this.db.doc('orgs/org1').update({ poster: path });
  }

  remove() {
    this.db.doc('orgs/org1').set({  });
  }
}
