import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { DashboardTitleShellComponent } from '@blockframes/movie/dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {

  public waterfallId$ = this.shell.movie$.pipe(map(m => m.id));

  constructor(private shell: DashboardTitleShellComponent) { }

}
