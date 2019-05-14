import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardViewComponent {
  @Input() investor: Investor;

  constructor() {}
}

