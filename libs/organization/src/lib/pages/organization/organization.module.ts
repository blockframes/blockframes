import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationFormModule } from '@blockframes/organization/forms/organization-form/organization-form.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { OrganizationComponent } from './organization.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    CommonModule,
    OrganizationFormModule,
    FlexLayoutModule,
    // Material
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: OrganizationComponent }])
  ]
})
export class OrganizationModule { }
