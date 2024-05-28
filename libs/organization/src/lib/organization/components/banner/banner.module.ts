// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrganizationBannerComponent } from './banner.component';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { OrgMoviesModule } from '@blockframes/organization/pipes/org-movies.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    // Blockframes
    ImageModule,
    MovieCardModule,
    MatButtonModule,
    MatRippleModule,
    OrgMoviesModule,

    // Material
    MatIconModule
  ],
  declarations: [OrganizationBannerComponent],
  exports: [OrganizationBannerComponent]
})
export class OrganizationBannerModule {}
