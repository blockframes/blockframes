// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';


@Component({
  selector: 'bf-ongoing-button',
  templateUrl: './ongoing-button.component.html',
  styleUrls: ['./ongoing-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OngoingButtonComponent {
  @Input() eventId: string;
 }
