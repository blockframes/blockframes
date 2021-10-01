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
import { ViewExtractedMoviesComponent } from './movies/view-extracted-movies.component';
import { ViewExtractedContractsComponent } from './contract/view-extracted-contracts.component';
import { ViewExtractedOrganizationsComponent } from './organizations/view-extracted-organizations.component';

@NgModule({
  declarations: [
    ViewExtractedMoviesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
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
    ViewExtractedMoviesComponent,
    ViewExtractedContractsComponent,
    ViewExtractedOrganizationsComponent,
  ],
})
export class ViewExtractedElementsModule {}
