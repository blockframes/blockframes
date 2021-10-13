import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';

@Component({
  selector: 'event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  click(role: 'organizer' | 'guest') {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ role });

    // Redirect user to identity page
    this.router.navigate(['r/identity'], { relativeTo: this.route });
  }

}
