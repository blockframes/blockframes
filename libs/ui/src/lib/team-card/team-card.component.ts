// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Interface
import { User } from '@blockframes/auth/+state';

function createUserView(user: Partial<User>) {
  return {
    avatar: user.avatar,
    name: `${user.firstName} ${user.lastName}`,
    position: user.position || '',
    email: user.email
  }
}

@Component({
  selector: '[user] team-card',
  templateUrl: 'team-card.component.html',
  styleUrls: ['./team-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCardComponent {
  public userView;
  @Input()
  set user(user: User) {
    this.userView = createUserView(user);
  };
}