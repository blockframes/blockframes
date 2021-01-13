import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrganizationCardMinimalComponent } from './card-minimal.component';
import { OrgNameModule } from '../../pipes/org-name.pipe';

@NgModule({
  declarations: [OrganizationCardMinimalComponent],
  exports: [OrganizationCardMinimalComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    OrgNameModule,
  ]
})
export class OrganizationCardMinimalModule { }
