import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { appUrlMarket } from '@env';

@Component({
  selector: 'admin-go-to',
  templateUrl: './go-to.component.html',
  styleUrls: ['./go-to.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoToComponent {
  public appUrlMarket = appUrlMarket;
  @Input() type: string = '';
  @Input() id: string = '';
  @Input() suffix: string = '';
  @Input() festival = true;
  @Input() catalog = true;
}
