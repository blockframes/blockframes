import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';

@Component({
  selector: 'event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent {

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  click() {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ lastName: 'bruce', firstName: 'test' });
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
