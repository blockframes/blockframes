import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: '[movie] movie-display-keywords',
  templateUrl: './display-keywords.component.html',
  styleUrls: ['./display-keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MovieDisplayKeywordsComponent {
  @Input() movie;
}
