import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { SpreadsheetImportEvent } from '../import-spreadsheet/import-spreadsheet.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ViewExtractedMoviesComponent } from '../view-extracted-elements/movies/view-extracted-movies.component';
import { ViewExtractedContractsComponent } from '../view-extracted-elements/contract/view-extracted-contracts.component';
import { ViewExtractedRightsComponent } from '../view-extracted-elements/rights/view-extracted-rights.component';
import { AuthQuery } from '@blockframes/auth/+state';
import { getCurrentApp } from '@blockframes/utils/apps';

@Component({
  selector: 'movie-import-container',
  templateUrl: './import-container.component.html',
  styleUrls: ['./import-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContainerComponent implements OnInit {

  @ViewChild('viewExtractedMoviesComponent') viewExtractedMoviesComponent: ViewExtractedMoviesComponent;
  @ViewChild('viewExtractedContractsComponent') viewExtractedContractsComponent: ViewExtractedContractsComponent;
  @ViewChild('viewExtractedRightsComponent') viewExtractedRightsComponent: ViewExtractedRightsComponent;

  public importedFiles = false;
  public fileType: string;
  public isUserBlockframesAdmin = false;

  constructor(
    private routerQuery: RouterQuery,
    private cdRef: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private authQuery: AuthQuery,
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  async next(importEvent: SpreadsheetImportEvent) {
    this.fileType = importEvent.fileType;
    this.cdRef.detectChanges();

    if (this.isUserBlockframesAdmin) {
      switch (importEvent.fileType) {
        default:
        case 'movies':
          await this.viewExtractedMoviesComponent.formatMovies(importEvent.sheet);
          break;
        case 'rights':
          await this.viewExtractedRightsComponent.formatDistributionRights(importEvent.sheet);
          break;
        case 'contracts':
          await this.viewExtractedContractsComponent.formatContracts(importEvent.sheet);
          break;
      }
    } else {
      const appName = getCurrentApp(this.routerQuery);
      switch (appName) {
        default:
        case 'catalog':
          await this.viewExtractedMoviesComponent.formatMovies(importEvent.sheet);
          break;
        case 'festival':
          // @TODO #2521 handle reserved territories
          await this.viewExtractedMoviesComponent.formatMovies(importEvent.sheet);
      }
    }
  }

  back() {
    this.fileType = undefined;
    this.cdRef.markForCheck();
  }

}
