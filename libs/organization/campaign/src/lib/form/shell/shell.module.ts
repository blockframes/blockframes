// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Components
import { CampaignFormShellComponent } from './shell.component';
import { TunnelLayoutModule } from '@blockframes/ui/tunnel';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [CampaignFormShellComponent],
  exports: [CampaignFormShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    TunnelLayoutModule,
    AppLogoModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class CampaignFormShellModule { }
