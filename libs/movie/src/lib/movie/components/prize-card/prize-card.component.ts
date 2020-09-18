// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Prize } from '../../+state/movie.model'

@Component({
  selector: '[prize] title-prize-card',
  templateUrl: 'prize-card.component.html',
  styleUrls: ['./prize-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrizeCardComponent {
  @Input() prize: Prize;
}