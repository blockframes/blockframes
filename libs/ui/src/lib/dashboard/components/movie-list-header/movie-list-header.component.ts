// Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dashboard-movie-list-header',
  templateUrl: './movie-list-header.component.html',
  styleUrls: ['./movie-list-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListHeaderComponent { }
