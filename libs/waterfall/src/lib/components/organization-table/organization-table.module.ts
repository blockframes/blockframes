// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { RightHolderNamePipeModule } from '../../pipes/rightholder-name.pipe';
import { VersionNamePipeModule } from '../../pipes/version-name.pipe';
import { RightholderSelectModalModule } from '../rightholder-select-modal/rightholder-select-modal.module';

// Component
import { OrganizationTableComponent } from './organization-table.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [OrganizationTableComponent],
  imports: [
    CommonModule,

    TableModule,
    GetOrgPipeModule,
    OrgChipModule,
    RightHolderNamePipeModule,
    VersionNamePipeModule,
    RightholderSelectModalModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,

    // Routing
    RouterModule,
  ],
  exports: [OrganizationTableComponent]
})
export class OrganizationTableModule { }
