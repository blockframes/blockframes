import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FeedbackMessage } from './feedback-message.module';

@Component({
  selector: 'feedback-message',
  templateUrl: './feedback-message.component.html',
  styleUrls: ['./feedback-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackMessageComponent {
  /** The message which should be displayed when this component is called. */
  @Input() public message: FeedbackMessage;

  /** The url of image which should be displayed when this component is called. */
  @Input() public imageUrl = '/assets/images/ppl_celebrating.png';

  /** The message of button which should be displayed when this component is called. */
  @Input() public buttonMessage = 'Explore your dashboard';

  /**
   * An event that notify the parent component that the user want to back
   * to his wallet or depending on the routerparams where he came from
   */
  @Output() public redirectUser = new EventEmitter();
}
