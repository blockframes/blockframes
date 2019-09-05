import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-principal-info',
  templateUrl: './display-principal-info.component.html',
  styleUrls: ['./display-principal-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayPrincipalInfoComponent {
  @Input() movie;
}
