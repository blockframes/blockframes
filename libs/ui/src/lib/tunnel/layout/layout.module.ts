import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TunnelLayoutComponent } from './layout.component';
import { TunnelNavComponent } from './nav/nav.component';
import { StepStatComponent } from './step-stat/step-stat.component';

import { TunnelExitModule } from '../exit/exit.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [TunnelLayoutComponent, TunnelNavComponent, StepStatComponent],
  exports: [TunnelLayoutComponent, TunnelNavComponent, StepStatComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    TunnelExitModule,
    // Material
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatListModule,
    MatSnackBarModule,
  ]
})
export class TunnelLayoutModule { }
