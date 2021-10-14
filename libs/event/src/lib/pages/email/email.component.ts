import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';

@Component({
  selector: 'event-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailComponent {

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  click() {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ lastName: 'bruce', firstName: 'test', email: 'foo@bar.com' });
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route });
  }

}
