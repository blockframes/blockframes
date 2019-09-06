import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'movie-display-principal-info',
  templateUrl: './display-principal-info.component.html',
  styleUrls: ['./display-principal-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayPrincipalInfoComponent {
  @Input() main;
  @Input() salesCast;
}
