import { Component, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormGroup } from '@angular/forms';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { RequestDemoInformations, createDemoRequestInformations } from '../../demo-request.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'catalog-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingPageComponent implements AfterViewInit {
  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  constructor(
    private snackBar: MatSnackBar,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions
  ) {}

  ngAfterViewInit() {
    /** Close the sidenav as we navigate. */
    this.routerQuery.select('navigationId').subscribe(() => this.sidenav.close());
  }

  /** Send a mail to the admin with user's informations. */
  private async sendDemoRequest(information: RequestDemoInformations) {
    const f = this.functions.httpsCallable('sendDemoRequest');
    return f(information).toPromise();
  }

  /** Triggers when a user click on the button from LearnMoreComponent.  */
  public sendRequest(form: FormGroup) {
    if (form.invalid) {
      this.snackBar.open('Please fill the required informations.', 'close', { duration: 2000 });
      return;
    }
    try {
      const information: RequestDemoInformations = createDemoRequestInformations(form.value);

      this.sendDemoRequest(information);
      this.snackBar.open('Your request has been sent !', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
