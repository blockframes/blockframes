import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { ReactiveFormsModule } from '@angular/forms';
import { OrganizationFormModule } from '@blockframes/organization/forms/organization-form/organization-form.module';
import { OrganizationFormAddressModule } from '@blockframes/organization/forms/organization-form-address/organization-form-address.module';

import { OrganizationComponent } from './organization.component';



@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    OrganizationFormModule,
    OrganizationFormAddressModule,
    RouterModule.forChild([{ path: '', component: OrganizationComponent }])
  ]
})
export class OrganizationModule { }
