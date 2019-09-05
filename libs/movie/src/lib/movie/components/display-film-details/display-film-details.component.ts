import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-film-details',
  templateUrl: './display-film-details.component.html',
  styleUrls: ['./display-film-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayFilmDetailsComponent {
  @Input() movie;
}
