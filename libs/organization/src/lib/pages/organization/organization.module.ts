import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { ReactiveFormsModule } from '@angular/forms';
import { OrganizationFormModule } from '@blockframes/organization/forms/organization-form/organization-form.module';

import { OrganizationComponent } from './organization.component';



@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    CommonModule,
    // ReactiveFormsModule,
    OrganizationFormModule,
    RouterModule.forChild([{ path: '', component: OrganizationComponent }])
  ]
})
export class OrganizationModule { }
