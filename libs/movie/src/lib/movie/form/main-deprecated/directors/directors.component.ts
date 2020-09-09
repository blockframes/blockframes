import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[form] movie-form-directors',
  templateUrl: './directors.component.html',
  styleUrls: ['./directors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectorsComponent {

  @Input() form;
}
