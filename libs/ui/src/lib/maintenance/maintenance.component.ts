import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MaintenanceService } from './maintenance.service';

@Component({
  selector: 'blockframes-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceComponent {

  isInMaintenance = true;
  // isInMaintenance$ = this.service.isInMaintenance('');

  constructor(
    private service: MaintenanceService
  ) { }

  refresh() {
    window.location.reload();
  }
}
