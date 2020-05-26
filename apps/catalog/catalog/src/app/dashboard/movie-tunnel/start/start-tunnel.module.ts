import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { StartTunnelComponent } from './start-tunnel.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Materials
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [StartTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    ImgAssetModule,
    AppLogoModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    // Router
    RouterModule.forChild([{ path: '', component: StartTunnelComponent }])
  ]
})
export class StartTunnelModule {}
