import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'movie-display-version-info',
  templateUrl: './display-version-info.component.html',
  styleUrls: ['./display-version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieDisplayVersionInfoComponent {
  @Input() main;
  @Input() versionInfo;
}
