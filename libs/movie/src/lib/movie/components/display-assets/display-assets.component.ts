import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[assets] movie-display-assets',
  templateUrl: './display-assets.component.html',
  styleUrls: ['./display-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayAssetsComponent {
  @Input() assets;
}
