import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-prizes',
  templateUrl: './display-prizes.component.html',
  styleUrls: ['./display-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayPrizesComponent {
  @Input() movie;
}
