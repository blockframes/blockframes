import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

// Components
import { OrganizationFormAddressComponent } from './organization-form-address.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    StaticSelectModule,
    // Material
    MatFormFieldModule,
    MatDividerModule,
    MatInputModule,
    MatCardModule,
  ],
  declarations: [
    OrganizationFormAddressComponent,
  ],
  exports: [OrganizationFormAddressComponent]
})
export class OrganizationFormAddressModule {}
