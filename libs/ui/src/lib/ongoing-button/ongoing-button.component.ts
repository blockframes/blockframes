// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'a[ongoing-button], button[ongoing-button]',
  templateUrl: './ongoing-button.component.html',
  styleUrls: ['./ongoing-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OngoingButtonComponent { }
