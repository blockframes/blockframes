import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelMainComponent } from './main.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';

// Materials
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

// Form modules
import { MovieFormTheatricalReleaseModule } from '@blockframes/movie/movie/form/sales-info/theatrical-release/theatrical-release.module';
import { MovieFormContentTypeModule } from '@blockframes/movie/movie/form/main/content-type/content-type.module';
import { MovieFormDirectorsModule } from '@blockframes/movie/movie/form/main/directors/directors.module';
import { MovieFormLanguagesModule } from '@blockframes/movie/movie/form/main/languages/languages.module';
import { MovieFormOriginalReleasesModule } from '@blockframes/movie/movie/form/sales-info/original-releases/original-releases.module';

@NgModule({
  declarations: [TunnelMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormTheatricalReleaseModule,
    MovieFormContentTypeModule,
    MovieFormDirectorsModule,
    MovieFormLanguagesModule,
    MovieFormOriginalReleasesModule,
    TunnelPageModule,
    // Material
    MatCardModule,
    MatDividerModule,
    // Routes
    RouterModule.forChild([{ path: '', component: TunnelMainComponent }])
  ]
})
export class MainTunnelModule { }
