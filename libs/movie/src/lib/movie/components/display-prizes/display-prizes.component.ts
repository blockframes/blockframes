import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[prizes] movie-display-prizes',
  templateUrl: './display-prizes.component.html',
  styleUrls: ['./display-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayPrizesComponent {
  @Input() prizes;
}
