// Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dashboard-no-title',
  templateUrl: './no-title.component.html',
  styleUrls: ['./no-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoTitleComponent { }
