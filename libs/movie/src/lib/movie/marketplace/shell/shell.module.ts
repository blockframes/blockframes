// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { TitleMarketplaceShellComponent } from './shell.component';

// Custom Modules
import { AppBarModule } from '@blockframes/ui/app-bar';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { HasKeysModule, ToLabelModule } from '@blockframes/utils/pipes';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { FileListPreviewModule } from '@blockframes/media/file/preview-list/preview-list.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

@NgModule({
  declarations: [TitleMarketplaceShellComponent],
  exports: [TitleMarketplaceShellComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    AppBarModule,
    CarouselModule,
    HasKeysModule,
    DownloadPipeModule,
    VideoViewerModule,
    ToLabelModule,
    FileListPreviewModule,

    // Material
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    // Routes
    RouterModule
  ]
})
export class MovieShellModule { }
