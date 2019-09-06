import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[rights] movie-display-availabilities',
  templateUrl: './display-availabilities.component.html',
  styleUrls: ['./display-availabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayAvailabilitiesComponent {
  @Input() rights;
}
