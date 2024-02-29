import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { PermissionsComponent } from './permissions.component';

// Blockframes
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder-select/rightholder-select.module';
import { OrganizationTableModule } from '@blockframes/waterfall/components/organization-table/organization-table.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [PermissionsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlgoliaAutocompleteModule,
    StorageFileModule,
    ImageModule,
    RightholderSelectModule,
    OrganizationTableModule,

    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    RouterModule.forChild([{ path: '', component: PermissionsComponent }])
  ]
})
export class PermissionsModule { }
