import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'logo-spinner',
  templateUrl: './logo-spinner.component.html',
  styleUrls: ['./logo-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoSpinnerComponent {
  constructor(
    @Inject(APP) public app: App
  ) { }
}
