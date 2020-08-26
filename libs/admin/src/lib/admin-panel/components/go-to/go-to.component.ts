import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { appUrl } from '@env';

@Component({
  selector: 'admin-go-to',
  templateUrl: './go-to.component.html',
  styleUrls: ['./go-to.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoToComponent {
  public appUrlMarket = appUrl.market;
  @Input() type = '';
  @Input() id = '';
  @Input() suffix = '';
  @Input() festival = true;
  @Input() catalog = true;
}
