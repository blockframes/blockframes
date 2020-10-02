// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

// Blockframes Utils
import { MaxLengthModule, ToLabelModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { VersionPipeModule } from '@blockframes/utils/pipes/version.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';

// Blockframes Movie
import { FilmographyPipeModule } from '@blockframes/movie/pipes/filmography.pipe';

// Blockframes Media
import { EmptyImagePipeModule } from '@blockframes/media/directives/image-reference/image-reference.pipe';

// Summary Components
import { SummaryMainComponent } from './main/main.component';
import { SummarySynopsisComponent } from './synopsis/synopsis.component';
import { SummaryProductionComponent } from './production/production.component';
import { SummaryArtisticComponent } from './artistic/artistic.component';
import { SummaryReviewComponent } from './review/review.component';
import { SummaryAdditionalInformationComponent } from './additional-information/additional-information.component';
import { SummaryTechnicalInfoComponent } from './technical-info/technical-info.component';
import { SummaryAvailableMaterialsComponent } from './available-materials/available-materials.component';
import { SummaryMediaFilesComponent } from './promotional/media-files/media-files.component';
import { SummaryMediaImagesComponent } from './promotional/media-images/media-images.component';
import { SummaryMediaVideosComponent } from './promotional/media-videos/media-videos.component';
import { SummaryMediaNotesComponent } from './promotional/media-notes/notes.component';
import { SummaryShootingInformationComponent } from './shooting-information/shooting-information.component';
import { SummarySalesPitchComponent } from './sales-pitch/sales-pitch.component';


@NgModule({
  declarations: [
    SummaryMainComponent,
    SummarySynopsisComponent,
    SummaryProductionComponent,
    SummaryArtisticComponent,
    SummaryReviewComponent,
    SummaryAdditionalInformationComponent,
    SummaryTechnicalInfoComponent,
    SummaryAvailableMaterialsComponent,
    SummaryMediaFilesComponent,
    SummaryMediaImagesComponent,
    SummaryMediaVideosComponent,
    SummaryMediaNotesComponent,
    SummaryShootingInformationComponent,
    SummarySalesPitchComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,

    MissingControlModule,
    ToLabelModule,
    EmptyImagePipeModule,
    VersionPipeModule,
    FileNameModule,
    FlexLayoutModule,
    DurationModule,
    TranslateSlugModule,
    HasStatusModule,
    MaxLengthModule,
    FilmographyPipeModule,

    // Materials
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule.forChild([])
  ],
  exports: [
    SummaryMainComponent,
    SummarySynopsisComponent,
    SummaryProductionComponent,
    SummaryArtisticComponent,
    SummaryReviewComponent,
    SummaryAdditionalInformationComponent,
    SummaryTechnicalInfoComponent,
    SummaryAvailableMaterialsComponent,
    SummaryMediaFilesComponent,
    SummaryMediaImagesComponent,
    SummaryMediaVideosComponent,
    SummaryMediaNotesComponent,
    SummaryShootingInformationComponent,
    SummarySalesPitchComponent,
  ]
})
export class MovieTunnelSummaryModule {}
