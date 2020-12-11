import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { firebase } from '@env';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Component({
  selector: 'admin-dev-area',
  templateUrl: './dev-area.component.html',
  styleUrls: ['./dev-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAreaComponent implements OnInit {
  public token: string;
  public projectId = firebase().projectId;
  public firebaseConsoleLink = `https://console.firebase.google.com/project/${firebase(getCurrentApp(this.routerQuery)).projectId}/database/`;

  constructor(
    private afAuth: AngularFireAuth,
    private cdRef: ChangeDetectorRef,
    private routerQuery: RouterQuery
  ) { }

  async ngOnInit() {
    this.token = await this.afAuth.authState.pipe(first())
      .toPromise()
      .then(auth => auth.getIdToken());
    this.cdRef.markForCheck();
  }

}
