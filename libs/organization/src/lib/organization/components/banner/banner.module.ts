// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrganizationBannerComponent } from './banner.component';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { OrgMoviesModule } from '@blockframes/organization/pipes/org-movies.pipe';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';

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
    OrgNameModule,
    ImageReferenceModule,
    MovieCardModule,
    MatLayoutModule,
    MatButtonModule,
    MatRippleModule,
    OrgMoviesModule,
    FilterByModule,

    // Material
    MatIconModule
  ],
  declarations: [OrganizationBannerComponent],
  exports: [OrganizationBannerComponent]
})
export class OrganizationBannerModule {}
