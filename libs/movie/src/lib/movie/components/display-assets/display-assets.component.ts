import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-assets',
  templateUrl: './display-assets.component.html',
  styleUrls: ['./display-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayAssetsComponent {
  @Input() movie;
}
