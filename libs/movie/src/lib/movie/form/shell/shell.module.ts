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
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

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
