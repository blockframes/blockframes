import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelMainComponent } from './main.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';

// Materials
import { MatCardModule } from '@angular/material/card';

// Form modules
import { MovieFormTheatricalReleaseModule } from '@blockframes/movie/movie/form/sales-info/theatrical-release/theatrical-release.module';
import { MovieFormContentTypeModule } from '@blockframes/movie/movie/form/main/content-type/content-type.module';

@NgModule({
  declarations: [TunnelMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormTheatricalReleaseModule,
    MovieFormContentTypeModule,
    TunnelPageModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: TunnelMainComponent }])
  ]
})
export class MainTunnelModule { }
