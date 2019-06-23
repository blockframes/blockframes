import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'movie-empty',
  templateUrl: './movie-empty.component.html',
  styleUrls: ['./movie-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEmptyComponent {
}
