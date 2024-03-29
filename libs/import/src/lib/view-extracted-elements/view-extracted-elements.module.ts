// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Libraries
import { TableExtractedElementsModule } from '../table-extracted-elements/table-extracted-elements.module';

// Components
import { ViewExtractedTitlesComponent } from './titles/view-extracted-titles.component';
import { ViewExtractedContractsComponent } from './contract/view-extracted-contracts.component';
import { ViewExtractedOrganizationsComponent } from './organizations/view-extracted-organizations.component';
import { ViewExtractedDocumentsComponent } from './documents/view-extracted-documents.component';
import { ViewExtractedSourcesComponent } from './sources/view-extracted-sources.component';
import { ViewExtractedRightsComponent } from './rights/view-extracted-rights.component';
import { ViewExtractedStatementsComponent } from './statements/view-extracted-statements.component';

@NgModule({
  declarations: [
    ViewExtractedTitlesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
    ViewExtractedDocumentsComponent,
    ViewExtractedSourcesComponent,
    ViewExtractedRightsComponent,
    ViewExtractedStatementsComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    TableExtractedElementsModule,

    // Material
    MatProgressSpinnerModule,
  ],
  exports: [
    ViewExtractedTitlesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
    ViewExtractedDocumentsComponent,
    ViewExtractedSourcesComponent,
    ViewExtractedRightsComponent,
    ViewExtractedStatementsComponent
  ],
})
export class ViewExtractedElementsModule {}
