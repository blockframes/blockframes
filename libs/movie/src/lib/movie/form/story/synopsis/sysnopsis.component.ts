import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
@Component({
  selector: '[form] movie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SynopsisComponent{

  @Input() form;
}
