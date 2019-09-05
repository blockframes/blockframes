import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-production',
  templateUrl: './display-production.component.html',
  styleUrls: ['./display-production.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayProductionComponent {
  @Input() movie;
}
