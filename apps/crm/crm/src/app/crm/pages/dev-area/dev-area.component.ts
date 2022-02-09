import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { firebase } from '@env';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: 'crm-dev-area',
  templateUrl: './dev-area.component.html',
  styleUrls: ['./dev-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAreaComponent implements OnInit {
  public token: string;
  public projectId = firebase().projectId;
  public firebaseConsoleLink = `https://console.firebase.google.com/project/${this.projectId}/database/`;

  constructor(
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.token = await this.authService.user$.pipe(first())
      .toPromise()
      .then(user => user.getIdToken());
    this.cdRef.markForCheck();
  }

}
