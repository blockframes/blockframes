import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieMain } from '../../+state';

@Component({
  selector: '[main] movie-display-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayMainComponent {

  @Input() data: MovieMain;

}
