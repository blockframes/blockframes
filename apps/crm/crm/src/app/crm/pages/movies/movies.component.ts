import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import {
  Movie,
  isScreening,
  CrmMovie,
  smartJoin,
  toLabel,
  Language,
  MovieLanguageSpecification,
  displayName,
  Analytics,
  ReleaseMediaValue,
  isMandate,
  Organization,
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/service';
import { EventService } from '@blockframes/event/service';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { filters } from '@blockframes/ui/list/table/filters';
import { ContractService } from '@blockframes/contract/contract/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { aggregate } from '@blockframes/analytics/utils';
import { UserService } from '@blockframes/user/service';

import { map, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

import { where } from 'firebase/firestore';
import { format } from 'date-fns';

@Component({
  selector: 'crm-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesComponent implements OnInit {
  public movies$?: Observable<CrmMovie[]>;
  public exporting = false;
  public exportingAnalytics = false;
  public sorts = sorts;
  public filters = filters;
  private orgs: Organization[] = [];

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private contractService: ContractService,
    private analyticsService: AnalyticsService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.movies$ = combineLatest([
      this.movieService.valueChanges(),
      this.orgService.valueChanges(),
      this.eventService.valueChanges([where('type', '==', 'screening')]),
      this.contractService.valueChanges([where('type', '==', 'mandate')])
    ]).pipe(
      tap(([_, orgs]) => this.orgs = orgs),
      map(([movies, orgs, events, mandates]) => {
        const screenings = events.filter(isScreening);
        return movies.map((movie) => {
          const mandate = mandates.filter(isMandate).find(m => m.titleId === movie.id);
          const org = orgs.find((o) => o.id === movie.orgIds[0]);
          const screeningCount = screenings.filter((e) => e.meta?.titleId === movie.id).length;
          const releaseMedias = movie.originalRelease.map(r => toLabel(r.media, 'releaseMedias') as ReleaseMediaValue).filter(r => r);
          return { ...movie, releaseMedias: Array.from(new Set(releaseMedias)), org, screeningCount, mandate };
        });
      })
    );
  }

  goToEditNewTab(id: string, $event: Event) {
    $event.stopPropagation();
    const urlTree = this.router.createUrlTree([`c/o/dashboard/crm/movie/${id}`]);
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noreferrer');
  }

  goToEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`]);
  }

  public exportTable(movies: CrmMovie[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const getLanguage = (m: Movie, key: keyof MovieLanguageSpecification) => {
        const result: Language[] = [];
        for (const [language, specification] of Object.entries(m.languages)) {
          if (specification[key]) result.push(language as Language);
        }
        return toLabel(result, 'languages');
      }

      const exportedRows = movies.map(m => ({
        'movie id': m.id,
        title: m.title.international,
        'season number': m.title.series ?? '--',
        'internal ref': m.internalRef ?? '--',
        org: m.org.name || '--',
        orgId: m.org?.id ?? '--',
        'catalog status': m.app.catalog.status,
        'catalog access': m.app.catalog.access ? 'yes' : 'no',
        'festival status': m.app.festival.status,
        'festival access': m.app.festival.access ? 'yes' : 'no',
        'financiers status': m.app.financiers.status,
        'financiers access': m.app.financiers.access ? 'yes' : 'no',
        screeningCount: m.screeningCount,
        'creation date': format(m._meta.createdAt, 'MM/dd/yyyy'),
        'last modification date': m._meta.updatedAt ? format(m._meta.updatedAt, 'MM/dd/yyyy') : '--',
        'audience goals': m.audience?.goals?.length ? smartJoin(m.audience.goals) : '',
        'audience targets': toLabel(m.audience.targets, 'socialGoals'),
        cast: smartJoin(m.cast.map(person => displayName(person))),
        'content type': toLabel(m.contentType, 'contentType'),
        crew: smartJoin(m.crew.map(person => displayName(person))),
        directors: smartJoin(m.directors.map(person => displayName(person))),
        'estimated budget': toLabel(`${m.estimatedBudget}`, 'budgetRange'),
        'expected premiere': m.expectedPremiere?.event ? `${m.expectedPremiere.event} (${m.expectedPremiere?.date ? format(m.expectedPremiere.date, 'MM/dd/yyyy') : 'no date'})` : '',
        format: m.format ? toLabel(m.format, 'movieFormat') : '',
        'format quality': toLabel(m.formatQuality, 'movieFormatQuality'),
        genres: toLabel(m.genres, 'genres'),
        'custom genres': m.customGenres ? smartJoin(m.customGenres) : '',
        'is orignal version available': m.isOriginalVersionAvailable ? 'yes' : 'no',
        'key assets': m.keyAssets,
        keywords: m.keywords ? smartJoin(m.keywords) : '',
        'languages dubbed': getLanguage(m, 'dubbed'),
        'languages subtitled': getLanguage(m, 'subtitle'),
        'languages captioned': getLanguage(m, 'caption'),
        logline: m.logline,
        'original languages': toLabel(m.originalLanguages, 'languages'),
        'origin countries': toLabel(m.originCountries, 'territories'),
        prizes: smartJoin(m.prizes.map(prize => prize.name)),
        'custom prizes': smartJoin(m.customPrizes.map(prize => prize.name)),
        certifications: toLabel(m.certifications, 'certifications'),
        producers: smartJoin(m.producers.map(person => displayName(person))),
        'production status': toLabel(m.productionStatus, 'productionStatus'),
        rating: smartJoin(m.rating.map(rate => `${rate.value} (${rate.country ? toLabel(rate.country, 'territories') : 'no country'})`)),
        release: `${m.release.status} ${m.release?.year ? (m.release.year) : ''}`,
        'release media': smartJoin(m.releaseMedias),
        'running time': m.runningTime?.time,
        'running time status': m.runningTime?.status,
        'running time episode count': m.runningTime?.episodeCount,
        scoring: toLabel(m.scoring, 'scoring'),
        'shooting date completed': m.shooting?.dates?.completed,
        'shooting date progress': m.shooting?.dates?.progress,
        'shooting planned': m.shooting?.dates?.planned?.from ? 'yes' : 'no',
        'shooting locations': m.shooting?.locations?.length ? smartJoin(m.shooting?.locations?.map(location => `${toLabel(location.country, 'territories')} (${smartJoin(location.cities)})`)) : '',
        'sound format': toLabel(m.soundFormat, 'soundFormat'),
        'production companies': smartJoin(m.stakeholders.productionCompany.map(company => company.displayName)),
        'co-production companies': smartJoin(m.stakeholders.coProductionCompany.map(company => company.displayName)),
        'broadcaster co-producer': smartJoin(m.stakeholders.broadcasterCoproducer.map(company => company.displayName)),
        'line producer': smartJoin(m.stakeholders.lineProducer.map(company => company.displayName)),
        distributor: smartJoin(m.stakeholders.distributor.map(company => company.displayName)),
        'sales agent': smartJoin(m.stakeholders.salesAgent.map(company => company.displayName)),
        laboratory: smartJoin(m.stakeholders.laboratory.map(company => company.displayName)),
        financier: smartJoin(m.stakeholders.financier.map(company => company.displayName)),
        synopsis: m.synopsis,
        orgIds: smartJoin(m.orgIds),
        'campaign started': m.campaignStarted ? format(m.campaignStarted, 'MM/dd/yyyy') : '',

        'has poster': m.poster?.storagePath ? 'yes' : 'no',
        'has banner': m.banner?.storagePath ? 'yes' : 'no',
        'has stills': m.promotional.still_photo?.some(s => s.storagePath) ? 'yes' : 'no',

        'has screener': m.promotional?.videos?.screener?.jwPlayerId ? 'yes' : 'no',
        'has public screener': m.promotional?.videos?.publicScreener?.jwPlayerId ? 'yes' : 'no',
        'has salesPitch': m.promotional?.videos?.salesPitch?.jwPlayerId ? 'yes' : 'no',
        'has otherVideo': m.promotional?.videos?.otherVideo?.jwPlayerId ? 'yes' : 'no',
      }));

      downloadCsvFromJson(exportedRows, 'movies-list');

      this.exporting = false;
    } catch (err) {
      this.exporting = false;
    }
    this.cdr.markForCheck();
  }

  public async exportTitleAnalytics(titles: CrmMovie[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const titleQuery = [where('type', '==', 'title')];
    const titleAnalytics = await this.analyticsService.load<Analytics<'title'>>(titleQuery);

    const availsSearchQuery = [where('type', '==', 'titleSearch'), where('name', 'in', ['filteredAvailsCalendar', 'filteredAvailsMap'])];
    const availsSearchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(availsSearchQuery);

    const allAnalytics = [...titleAnalytics, ...availsSearchAnalytics].filter(analytic => !analytic.meta.ownerOrgIds?.includes(analytic.meta.orgId));

    const allUids = unique(allAnalytics.map(analytic => analytic.meta.uid));
    const allUsers = await this.userService.load(allUids);

    const exportedRows = [];
    for (const title of titles) {
      const movieAnalytics = allAnalytics.filter(analytic => analytic.meta.titleId === title.id);
      const uidsWithAnalytics = allUids.filter(uid => movieAnalytics.some(analytic => analytic.meta.uid === uid));
      const orgs = this.orgs.filter(o => title.orgIds.includes(o.id));

      for (const uid of uidsWithAnalytics) {
        const userAnalytics = movieAnalytics.filter(analytic => analytic.meta.uid === uid);
        const user = allUsers.find(u => u?.uid === uid);
        const org = this.orgs.find(o => o.id === user?.orgId);
        const a = aggregate(userAnalytics);

        exportedRows.push({
          'title id': title.id,
          title: title.title.international,
          'title org id(s)': title?.orgIds?.join(', '),
          'title org(s) name': orgs.map(o => o.name).join(', '),
          uid,
          user: user ? displayName(user) : '--deleted user--',
          'user email': user?.email ?? '--',
          'user org id': user?.orgId ?? '--',
          'org name': org ? org.name : '--',
          'total interactions': a.interactions.global.count,
          'interactions on catalog': a.interactions.catalog.count,
          'interactions on festival': a.interactions.festival.count,
          'first interaction on catalog': a.interactions.catalog.first ? format(a.interactions.catalog.first, 'MM/dd/yyyy') : '--',
          'last interaction on catalog': a.interactions.catalog.last ? format(a.interactions.catalog.last, 'MM/dd/yyyy') : '--',
          'last interaction on festival': a.interactions.festival.last ? format(a.interactions.festival.last, 'MM/dd/yyyy') : '--',
          'page views': a.pageView,
          'screenings requested': a.screeningRequested,
          'asking price requested': a.askingPriceRequested,
          'promo element opened': a.promoElementOpened,
          'added to wishlist': a.addedToWishlist,
          'removed from wishlist': a.removedFromWishlist,
          'filtered Avails Calendar': a.filteredAvailsCalendar ?? 0,
          'filtered Avails Map': a.filteredAvailsMap ?? 0,
        });
      }
    }
    downloadCsvFromJson(exportedRows, 'movies-analytics-list');

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }

}
