import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: 'event-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLoginComponent {

  constructor(private service: AuthService) { }

  async click() {

    await this.service.deleteAnonymousUser();
    await this.service.signin('dev+kenton-kws@blockframes.io', 'blockframes');

    // Update store with from value
    /* this.authStore.updateAnonymousCredentials({ lastName: 'bruce', firstName: 'test' });
     // Redirect user to event view
     this.router.navigate(['../i'], { relativeTo: this.route });*/
  }
}
