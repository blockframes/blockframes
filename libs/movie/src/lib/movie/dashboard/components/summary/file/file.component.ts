// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { MoviePromotionalElementsForm } from '../../../../form/movie.form';

// RxJs
import { Subscription } from 'rxjs';

const fileRefs = {
  presentation_deck: 'Presentation Deck',
}

const fileLinks = {
  promo_reel_link: 'Promo Reel',
  screener_link: 'Screener',
  trailer_link: 'Trailer',
  teaser_link: 'Pitch Teaser'
} as const;

@Component({
  selector: '[promotional] movie-summary-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFileComponent {
  private sub: Subscription;
  fileLinks = fileLinks;
  fileRefs = fileRefs;

  @Input() promotional: MoviePromotionalElementsForm;
  @Input() link: string;
}
