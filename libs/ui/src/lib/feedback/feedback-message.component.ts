import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
  selector: 'feedback-message',
  templateUrl: './feedback-message.component.html',
  styleUrls: ['./feedback-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackMessageComponent {
  @HostBinding('attr.page-id') pageId = 'feedback-message';
  /** The title which should be displayed when this component is called. */
  @Input() public title: string;

  /** The sub-title which should be displayed when this component is called. */
  @Input() public subTitle: string;

  /** The url of image which should be displayed when this component is called. */
  @Input() public imageUrl = 'Congrats_380.png';
  // TODO #1387

  /** The message of button which should be displayed when this component is called. */
  @Input() public buttonMessage = 'Explore your dashboard';

  /** Whether the button is enabled or not */
  @Input() public enabled = true;

  /** An event that notify the parent component that the user want to go back */
  @Output() public redirectUser = new EventEmitter();
}
