import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { PermissionsComponent } from './permissions.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RightholderSelectModule } from '@blockframes/waterfall/components/rightholder-select/rightholder-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [PermissionsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    GetOrgPipeModule,
    OrgChipModule,
    RightHolderNamePipeModule,
    AlgoliaAutocompleteModule,
    StorageFileModule,
    ImageModule,
    RightholderSelectModule,

    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: PermissionsComponent }])
  ]
})
export class PermissionsModule { }
