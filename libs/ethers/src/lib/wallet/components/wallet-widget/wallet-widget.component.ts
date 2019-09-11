import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'wallet-widget',
  templateUrl: './wallet-widget.component.html',
  styleUrls: ['./wallet-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletWidgetComponent {
  constructor() {}
}
