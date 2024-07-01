import { ChangeDetectionStrategy, Component, Optional } from '@angular/core';
import { Intercom } from '@supy-io/ngx-intercom';

@Component({
  selector: 'catalog-congratulations',
  templateUrl: 'congratulations.component.html',
  styleUrls: ['./congratulations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CongratulationsComponent {

  constructor(
    @Optional() private intercom: Intercom
  ) { }

  public openIntercom() {
    return this.intercom.show();
  }
}
