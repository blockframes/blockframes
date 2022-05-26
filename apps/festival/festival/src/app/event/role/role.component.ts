import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { AnonymousRole } from '@blockframes/model';
import { EventService } from '@blockframes/event/+state';
@Component({
  selector: 'festival-event-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventRoleComponent {

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async update(role: AnonymousRole) {
    const eventId: string = this.route.snapshot.params.eventId;
    const event = await this.eventService.getValue(eventId);
    // Update store with from value
    this.authService.updateAnonymousCredentials({ role });
    // Redirect user identity or login page
    const page = event.accessibility === 'protected' ? 'email' : 'identity';
    this.router.navigate(['..', page], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
