import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormCountryModule } from '@blockframes/ui/form/country/country.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

// Components
import { OrganizationLiteFormComponent } from './organization-lite-form.component';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FormCountryModule,

    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatRadioModule,
  ],
  declarations: [
    OrganizationLiteFormComponent,
  ],
  exports: [
    OrganizationLiteFormComponent
  ]
})
export class OrganizationLiteFormModule { }
