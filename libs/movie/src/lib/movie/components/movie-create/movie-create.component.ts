import { Component, ChangeDetectionStrategy, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'movie-create',
  templateUrl: './movie-create.component.html',
  styleUrls: ['./movie-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCreateComponent {
  @HostBinding('attr.page-id') pageId = 'movie-create';
  @Output() addMovie = new EventEmitter<void>()

  constructor() { }
}
