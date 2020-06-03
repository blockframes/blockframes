import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '../../+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {

  @Input() invitation: Invitation;

}
