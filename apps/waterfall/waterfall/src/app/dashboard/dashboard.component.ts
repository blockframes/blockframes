// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'waterfall-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
