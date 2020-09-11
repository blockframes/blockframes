// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DashboardTitleShellComponent } from './shell.component';

@NgModule({
  declarations: [DashboardTitleShellComponent],
  exports: [DashboardTitleShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
  ],
})
export class DashboardTitleShellModule { }
