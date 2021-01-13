import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationCardComponent } from './card.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { OrgAddressModule } from '../../pipes/org-address.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { OrgMoviesModule } from '@blockframes/organization/pipes/org-movies.pipe';


@NgModule({
  declarations: [OrganizationCardComponent],
  exports: [OrganizationCardComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    ToLabelModule,
    OrgNameModule,
    OrgAddressModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatRippleModule,
    OrgMoviesModule,
  ]
})
export class OrganizationCardModule { }
