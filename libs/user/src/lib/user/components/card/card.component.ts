// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Interface
import { createStorageFile, User } from '@blockframes/model';
import { displayName } from '@blockframes/model';

function createUserView(user: Partial<User>) {
  return {
    avatar: createStorageFile(user.avatar),
    name: displayName(user),
    position: user.position || '',
    email: user.email,
    hideEmail: user.hideEmail
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
