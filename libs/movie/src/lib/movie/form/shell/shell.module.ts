// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { MovieFormShellComponent } from './shell.component';
import { TunnelLayoutModule } from '@blockframes/ui/tunnel';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [MovieFormShellComponent],
  exports: [MovieFormShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    TunnelLayoutModule,
    AppLogoModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
})
export class MovieFormShellModule { }
