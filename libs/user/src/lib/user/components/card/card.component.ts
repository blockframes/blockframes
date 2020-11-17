// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Interface
import { User } from '@blockframes/auth/+state';
import { displayName } from '@blockframes/utils/pipes/display-name.pipe';

function createUserView(user: Partial<User>) {
  return {
    avatar: user.avatar,
    name: `${displayName(user)}`,
    position: user.position || '',
    email: user.email
  }
}

@Component({
  selector: 'user-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public userView;
  @Input()
  set user(user: User) {
    this.userView = createUserView(user);
  };
}
