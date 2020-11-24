import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '../../+state/movie.model';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public hasOverlay = false;
  public placeholder: string;
  public ltLg$ = this.breakpointsService.ltLg;

  @Input() size: 'banner' | 'poster' | 'avatar';
  @Input() movie: Movie;
  @Input() link: string | string[] = "..";

  constructor(private breakpointsService: BreakpointsService) { }

  get placeholderAsset() {
    return this.size === 'banner'
      ? 'empty_banner.webp'
      : 'empty_poster.webp';
  }
}
