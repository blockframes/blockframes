import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'admin-layout',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent { }
