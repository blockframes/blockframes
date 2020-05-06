import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationCardComponent } from './card.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';
import { OrgAddressModule } from '../../pipes/org-address.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [OrganizationCardComponent],
  exports: [OrganizationCardComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
    ToLabelModule,
    OrgNameModule,
    OrgAddressModule,
    MatCardModule
  ]
})
export class OrganizationCardModule { }
