import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'admin-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit {

  public token: string;

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
