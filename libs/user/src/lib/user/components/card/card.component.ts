// Angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Interface
import { User } from '@blockframes/auth/+state';

@Component({
  selector: 'user-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() user: User;
}
