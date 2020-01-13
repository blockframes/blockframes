import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieSalesInfoForm } from './../sales-info.form';

@Component({
  selector: '[form] movie-theatrical-release',
  templateUrl: './theatrical-release.component.html',
  styleUrls: ['./theatrical-release.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheatricalReleaseComponent {
  @Input() form: MovieSalesInfoForm;

  constructor() { }
}
