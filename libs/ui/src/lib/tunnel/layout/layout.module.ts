import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TunnelLayoutComponent } from './layout.component';
import { TunnelNavComponent, StepActivePipe } from './nav/nav.component';
import { TunnelStepStatComponent } from './step-stat/step-stat.component';
import { UploadWidgetModule } from '@blockframes/media/file/upload-widget/upload-widget.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
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
    ConfirmModule,
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
