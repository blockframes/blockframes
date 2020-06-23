import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationCardComponent } from './card.component';
import { ImgModule } from '@blockframes/media/components/img/img.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { OrgAddressModule } from '../../pipes/org-address.pipe';
import { ToLabelModule, TranslateSlugModule } from '@blockframes/utils/pipes';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [OrganizationCardComponent],
  exports: [OrganizationCardComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImgModule,
    ToLabelModule,
    OrgNameModule,
    OrgAddressModule,
    TranslateSlugModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatRippleModule,
  ]
})
export class OrganizationCardModule { }
