import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainControl } from '../main.form';

@Component({
  selector: '[form] movie-form-directors',
  templateUrl: './directors.component.html',
  styleUrls: ['./directors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectorsComponent {

  @Input() form: MovieMainControl['directors'];

  constructor() { }

  add() {
    this.form.add();
  }

  remove(i: number) {
    this.form.removeAt(i);
  }
}
