import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MaintenanceService } from './maintenance.service';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'blockframes-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceComponent {

  // Use startWth true to avoid flash
  isInMaintenance$ = this.service.isInMaintenance$.pipe(startWith(true));

  constructor(private service: MaintenanceService) { }

  refresh() {
    window.location.reload();
  }
}
