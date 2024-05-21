import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { PermissionsComponent } from './permissions.component';

// Blockframes
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder/rightholder-select/rightholder-select.module';
import { OrganizationTableModule } from '@blockframes/waterfall/components/organization/organization-table/organization-table.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

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
