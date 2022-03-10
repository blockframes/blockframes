// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Interface
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { User } from '@blockframes/model';
import { displayName } from '@blockframes/utils/utils';

function createUserView(user: Partial<User>) {
  return {
    avatar: createStorageFile(user.avatar),
    name: displayName(user),
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
