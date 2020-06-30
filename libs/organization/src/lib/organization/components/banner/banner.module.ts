// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatGridListModule } from "@angular/material/grid-list";

// BlockFrames
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrganizationBannerComponent } from './banner.component';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

// Blockframes
// import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    OrgNameModule,
    ImageReferenceModule,
    MovieCardModule,
    MatLayoutModule,
    MatGridListModule
  ],
  declarations: [OrganizationBannerComponent],
  exports: [OrganizationBannerComponent]
})
export class OrganizationBannerModule {}
