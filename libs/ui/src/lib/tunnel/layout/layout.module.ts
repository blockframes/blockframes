import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TunnelLayoutComponent } from './layout.component';
import { TunnelNavComponent, StepActivePipe } from './nav/nav.component';
import { TunnelStepStatComponent } from './step-stat/step-stat.component';
import { UploadWidgetModule } from '@blockframes/media/components/upload/widget/upload-widget.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [
    TunnelLayoutComponent,
    TunnelNavComponent,
    TunnelStepStatComponent,
    StepActivePipe
  ],
  exports: [
    TunnelLayoutComponent,
    TunnelNavComponent,
    TunnelStepStatComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    UploadWidgetModule,
    // Material
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ]
})
export class TunnelLayoutModule { }
