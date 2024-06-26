import { Inject, Injectable } from '@angular/core';
import {
  App,
  appName,
  toLabel,
  MovieAvailsSearch,
  trimString,
  PdfParams,
  PdfParamsFilters,
  pdfExportLimit,
  toGroupLabel,
  StatementPdfParams,
  Statement
} from '@blockframes/model';
import { firebaseRegion, firebase } from '@env';
import { EmulatorsConfig, EMULATORS_CONFIG } from './emulator-front-setup';
import { APP } from './routes/utils';
import { sanitizeFileName } from './file-sanitizer';
import { AnalyticsService } from '@blockframes/analytics/service';
import { ModuleGuard } from './routes/module.guard';
import { format } from 'date-fns';

const { projectId } = firebase();

export interface DownloadSettings {
  titleIds: string[],
  orgId?: string,
  filters?: MovieAvailsSearch
}

export interface DownloadStatementSettings {
  number: number;
  statement: Statement;
  waterfallId: string;
  versionId: string;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class PdfService {

  /**
   * Firebase functions only allow a max size of 10mb for http requests
   * @see https://firebase.google.com/docs/functions/quotas#resource_limits
   * So we need to add a maximum of movies that can be exported to PDF.
   */
  public exportLimit = pdfExportLimit;

  constructor(
    @Inject(APP) private app: App,
    @Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig,
    private analyticsService: AnalyticsService,
    private moduleGuard: ModuleGuard
  ) { }

  canDownload({ filters, titleIds }: DownloadSettings) {
    if (!titleIds.length) {
      this.analyticsService.addPdfExport(filters, titleIds.length, this.moduleGuard.currentModule, false);
      return { status: false, message: 'You have no published titles.' };
    }
    if (titleIds.length >= this.exportLimit) {
      this.analyticsService.addPdfExport(filters, titleIds.length, this.moduleGuard.currentModule, false);
      return { status: false, message: 'Sorry, you can\'t have an export with that many titles.' };
    }
    return { status: true };
  }

  async download(settings: DownloadSettings) {
    const filters = this.getFilters(settings.filters);
    const fileName = this.getFileName(filters);
    const data: PdfParams = {
      app: this.app,
      filters,
      titleIds: settings.titleIds,
      orgId: settings.orgId
    };

    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }

    const url = this.emulatorsConfig.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`;

    const status: boolean = await new Promise(resolve => {
      fetch(url, params,).then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', sanitizeFileName(`${fileName}.pdf`));
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        }).catch(_ => resolve(false));
    });

    this.analyticsService.addPdfExport(settings.filters, settings.titleIds.length, this.moduleGuard.currentModule, status);

    return status;
  }

  /**
   * catalog: Archipel Content Library - Avails for [Territory] in [Rights] - [Content Type] - [Genre]
   * festival: Archipel Market Library - [Genre] - [Country of Origin]
   * financiers: Media Financiers Library
   * @param filters 
   * @returns string
   */
  private getFileName(filters: PdfParamsFilters) {
    const fileNameParts: string[] = [`${appName[this.app]} Library`];

    if (filters.avails) fileNameParts.push(`Avails for ${filters.avails}`);
    if (filters.contentType) fileNameParts.push(filters.contentType);
    if (filters.genres) fileNameParts.push(filters.genres);
    if (filters.originCountries) fileNameParts.push(filters.originCountries);

    return fileNameParts.filter(s => s).join(' - ');
  }

  private getFilters(search: MovieAvailsSearch) {
    const filters: PdfParamsFilters = {};

    if (search?.avails) {
      const availForm = search.avails;

      if (availForm.territories?.length && availForm.medias?.length) {
        const territories = toGroupLabel(availForm.territories, 'territories', 'World').join(', ');
        const rights = toGroupLabel(availForm.medias, 'medias', 'All Rights').join(', ');
        filters.avails = `${trimString(territories, 50, true)} in ${trimString(rights, 50, true)}`;

        if (availForm.exclusive !== undefined) {
          filters.avails = `${filters.avails}, ${availForm.exclusive ? 'exclusive' : 'non exclusive'} rights`;
        }

        if (availForm.duration.from && availForm.duration.to) {
          filters.avails = `${filters.avails} for ${format(availForm.duration.from, 'MM/dd/yyyy')} - ${format(availForm.duration.to, 'MM/dd/yyyy')}`;
          if (availForm.exclusive !== undefined) filters.availsFormValue = encodeURIComponent(JSON.stringify(availForm)); // if avails form complete
        }
      }

    }

    if (search?.search) {
      const searchForm = search.search;

      if (this.app === 'catalog' && searchForm.contentType) {
        filters.contentType = toLabel(searchForm.contentType, 'contentType');
      }

      if (searchForm.genres) filters.genres = toLabel(searchForm.genres, 'genres');

      if (this.app === 'festival' && searchForm.originCountries) {
        filters.originCountries = toLabel(searchForm.originCountries, 'territories');
      }
    }

    return filters;
  }

  async downloadStatement(settings: DownloadStatementSettings) {
    const data: StatementPdfParams = {
      statementId: settings.statement.id,
      waterfallId: settings.waterfallId,
      number: settings.number,
      versionId: settings.versionId
    };

    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

    const url = this.emulatorsConfig.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/statementToPdf`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/statementToPdf`;

    const status: boolean = await new Promise(resolve => {
      fetch(url, params,).then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', sanitizeFileName(`${settings.fileName}.pdf`));
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        }).catch(_ => resolve(false));
    });

    return status;
  }
}
