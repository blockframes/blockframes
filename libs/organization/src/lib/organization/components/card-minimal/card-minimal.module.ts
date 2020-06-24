import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OrganizationCardMinimalComponent } from './card-minimal.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrgNameModule } from '../../pipes/org-name.pipe';

// Material
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [OrganizationCardMinimalComponent],
  exports: [OrganizationCardMinimalComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    OrgNameModule,
    MatRippleModule,
  ]
})
export class OrganizationCardMinimalModule { }
