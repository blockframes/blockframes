// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';


@Component({
  selector: 'movie-tag',
  templateUrl: 'tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {
  @Input() label: string;
}
