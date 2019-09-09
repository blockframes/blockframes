import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[synopsis] movie-display-synopsis',
  templateUrl: './display-synopsis.component.html',
  styleUrls: ['./display-synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieDisplaySynopsisComponent {
  @Input() synopsis;
}
