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
  }
}
