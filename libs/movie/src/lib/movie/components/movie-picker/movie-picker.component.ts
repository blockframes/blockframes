import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'movie-picker',
  templateUrl: './movie-picker.component.html',
  styleUrls: ['./movie-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviePickerComponent {
  constructor() {}
}
