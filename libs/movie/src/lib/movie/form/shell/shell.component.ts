// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Data } from '@angular/router';
import { AbstractControl } from '@angular/forms';

// Blockframes
import { TunnelRoot, TunnelStep, TunnelLayoutComponent } from '@blockframes/ui/tunnel';
import { FORMS_CONFIG, ShellConfig } from '../movie.shell.interfaces';
import { createStorageFile, Movie, ProductionStatus, StorageFile } from '@blockframes/model';
import { isChrome } from '@blockframes/utils/browser/utils';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { FileLabel, getFileMetadata } from '@blockframes/media/+state/static-files';
import { getDeepValue } from '@blockframes/utils/pipes';
import { FormList } from '@blockframes/utils/form';

// RxJs
import { map, pluck, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, Subscription } from 'rxjs';

function isStatus(prodStatus: ProductionStatus, acceptableStatus: ProductionStatus[]) {
  return acceptableStatus.includes(prodStatus)
}

function getSteps(status: ProductionStatus, appSteps: TunnelStep[] = []): TunnelStep[] {
  const steps: TunnelStep[] = [{
    title: 'First Step',
    icon: 'home',
    time: 2,
    routes: [{ path: 'title-status', label: 'Production Status' }],
  },
  {
    title: 'Title Information',
    icon: 'document',
    time: 15,
    routes: [{
      path: 'main',
      label: 'Main Information'
    }, {
      path: 'story-elements',
      label: 'Storyline Elements'
    }, {
      path: 'production',
      label: 'Production Information'
    }, {
      path: 'artistic',
      label: 'Artistic Team'
    }, {
      path: 'reviews',
      label: 'Selections & Reviews',
      shouldHide: isStatus(status, ['development', 'shooting'])
    }, {
      path: 'additional-information',
      label: 'Additional Information'
    }, {
      path: 'shooting-information',
      label: 'Shooting Information',
      shouldHide: isStatus(status, ['released'])
    }, {
      path: 'technical-spec',
      label: 'Technical Specification'
    }, {
      path: 'available-versions',
      label: 'Versions',
      shouldHide: isStatus(status, ['development'])
    }]
  }, {
    title: 'Promotional Elements',
    icon: 'cloud_upload',
    time: 10,
    routes: [
      {
        path: 'media-files',
        label: 'Files'
      },
      {
        path: 'media-images',
        label: 'Images'
      },
      {
        path: 'media-videos',
        label: 'Videos'
      },
      {
        path: 'media-notes',
        label: 'Notes & Statements',
        shouldHide: isStatus(status, ['post_production', 'finished', 'released'])
      }
    ]
  },
  ...appSteps,
  {
    title: 'Last Step',
    icon: 'send',
    time: 3,
    routes: [{
      path: 'summary',
      label: 'Summary & Submission'
    }]
  }];
  return steps.map(step => {
    return {
      ...step,
      routes: step.routes.filter(route => !route?.shouldHide)
    }
  })
}

function getPath(id: string, label: FileLabel, index?: number) {
  const field = getFileMetadata('movies', label, id).field;
  return index !== undefined ? `${field}.${index}` : field;
}

@Component({
  selector: 'movie-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShellComponent implements TunnelRoot, OnInit, OnDestroy {
  @ViewChild(TunnelLayoutComponent) layout: TunnelLayoutComponent;
  private sub: Subscription;

  steps$: Observable<TunnelStep[]>;

  private movieId$: Observable<string> = this.route.params.pipe(
    pluck('movieId'),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  exitRoute$: Observable<string> = this.movieId$.pipe(
    map((movieId: string) => `/c/o/dashboard/title/${movieId}`)
  );

  private fileSub = this.movieId$.pipe(
    switchMap(id => this.movieService.valueChanges(id)),
    tap(movie => this.patchFiles(movie))
  ).subscribe();

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private movieService: MovieService
  ) {}

  async ngOnInit() {
    this.configs.movie.onInit();
    await this.configs.campaign?.onInit();
    this.cdr.markForCheck();

    const productionStatusControl = this.getForm('movie').productionStatus;
    const productionStatus$ = productionStatusControl.valueChanges.pipe(
      startWith(productionStatusControl.value),
      tap((productionStatus: ProductionStatus) => this.configs.movie.fillHiddenMovieInputs(productionStatus))
    );

    this.steps$ = combineLatest([productionStatus$, this.route.data]).pipe(
      map(([productionStatus, data]: [ProductionStatus, Data]) => getSteps(productionStatus, data.appSteps))
    );

    this.sub = this.route.fragment.subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);

      el?.scrollIntoView({
        behavior: isChrome() ? 'auto' : 'smooth',
        block: 'center',
        inline: 'start',
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.fileSub?.unsubscribe();
    this.getForm('movie').reset();
    this.getForm('campaign')?.reset();
  }

  getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name]?.form;
  }

  private checkIfElementIsReady(id: string) {
    return new Promise<HTMLElement>(resolve => {
      const el = this.doc.getElementById(id);
      if (el) resolve(el);
      new MutationObserver(() => {
        resolve(this.doc.getElementById(id));
      }).observe(this.doc.documentElement, { childList: true, subtree: true });
    });
  }

  private patchFiles(movie: Movie) {
    const movieFiles: FileLabel[] = [
      'poster',
      'banner',
      'scenario',
      'moodboard',
      'presentation_deck',
      'screener',
      'salesPitch',
      'delivery',
      'otherVideos',
      'still_photo',
      'notes'
    ];

    for (const file of movieFiles) {
      this.patchFile(movie, file);
    }
  }

  /**
   * Patches the value of file in form after the file has been uploaded
   * @param index index of file in array
   */
  private patchFile(movie: Movie, label: FileLabel, index?: number) {
    const path = getPath(movie.id, label, index);
    const incoming = getDeepValue(movie, path) as StorageFile;

    if (Array.isArray(incoming)) {
      for (const index of incoming.keys()) {
        this.patchFile(movie, label, index);
      }
      return;
    }

    const movieForm = this.getForm('movie');
    const current = getDeepValue(movieForm.value, path) as StorageFile;

    if (incoming.storagePath !== current.storagePath) {

      let form: AbstractControl;
      if (index !== undefined) {
        const formPath = getPath(movie.id, label);
        const formList = getDeepValue(movieForm, formPath) as FormList<AbstractControl>;
        form = formList.get(`${index}`);
      } else {
        form = getDeepValue(movieForm, path);
      }
      const storageFile = createStorageFile(incoming, false);
      form.patchValue(storageFile);
    }
  }
}
