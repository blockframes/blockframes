// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Prize } from '../../+state/movie.model'

@Component({
  selector: '[prize] movie-festival-prize-card',
  templateUrl: 'festival-prize-card.component.html',
  styleUrls: ['./festival-prize-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FestivalPrizeCardComponent {
  @Input() prize: Prize;
}