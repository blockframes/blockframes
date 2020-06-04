import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { firebase } from '@env';

@Component({
  selector: 'admin-dev-area',
  templateUrl: './dev-area.component.html',
  styleUrls: ['./dev-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAreaComponent implements OnInit {
  public token: string;
  public projectId = firebase.projectId;
  public firebaseConsoleLink = `https://console.firebase.google.com/project/${firebase.projectId}/database/`;

  constructor(
    private afAuth: AngularFireAuth,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.token = await this.afAuth.authState.pipe(first())
      .toPromise()
      .then(auth => auth.getIdToken());
    this.cdRef.markForCheck();
  }

}
