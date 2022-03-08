// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Prize } from '@blockframes/data-model'
import { festival } from '@blockframes/utils/static-model';

@Component({
  selector: '[prize] title-prize-card',
  templateUrl: 'prize-card.component.html',
  styleUrls: ['./prize-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrizeCardComponent {
  @Input() prize: Prize;
  public festival = festival;
}
