import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '../../+state/movie.model';
import { scaleIn } from '@blockframes/utils/animations/fade';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit {
  public hasOverlay = false;
  public placeholder: string;

  @Input() size: 'banner' | 'poster' | 'avatar';
  @Input() movie: Movie;
  @Input() link = "..";

  ngOnInit() {
    if (this.size === 'banner') {
      this.placeholder = 'empty_slider.webp';
    } else {
      this.placeholder = 'empty_poster.webp';
    }
  }
}

