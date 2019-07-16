import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

interface InputMessage {
  headline: string;
  subline: string;
  isError: boolean;
}

@Component({
  selector: 'wallet-message-view',
  templateUrl: './wallet-message-view.component.html',
  styleUrls: ['./wallet-message-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletMessageViewComponent {
  /** The message which should be displayed when this component is called. */
  @Input() public message: InputMessage;

  /** 
   * An event that notify the parent component that the user want to back
   * to his wallet or depending on the routerparams where he came from
   */
  @Output() public redirectUser: EventEmitter<void> = new EventEmitter();
}
