import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'movie-display-production',
  templateUrl: './display-production.component.html',
  styleUrls: ['./display-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieDisplayProductionComponent {
  @Input() productionCompanies;
  @Input() broadcasterCoproducers;
}
