import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'crm-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardsComponent {
  public waterfall$ = this.shell.waterfall$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.shell.setDate(undefined);
  }
  
  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }
  
}