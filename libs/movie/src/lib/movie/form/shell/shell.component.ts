// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Data } from '@angular/router';

// Blockframes
import { TunnelRoot, TunnelStep, TunnelLayoutComponent } from '@blockframes/ui/tunnel';
import { FORMS_CONFIG, ShellConfig } from '../movie.shell.interfaces';
import { ProductionStatus } from '@blockframes/model';
import { isChrome } from '@blockframes/utils/browser/utils';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';

// RxJs
import { map, pluck, startWith, tap } from 'rxjs/operators';
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

@Component({
  selector: 'movie-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShellComponent implements TunnelRoot, OnInit, OnDestroy {
  @ViewChild(TunnelLayoutComponent) layout: TunnelLayoutComponent;
  private subs: Subscription[] = [];

  public saving = false;

  steps$: Observable<TunnelStep[]>;

  exitRoute$: Observable<string> = this.route.params.pipe(
    pluck('movieId'),
    map((movieId: string) => `/c/o/dashboard/title/${movieId}`)
  );

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private uploadService: FileUploaderService
  ) { }

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

    this.subs.push(this.route.fragment.subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);

      el?.scrollIntoView({
        behavior: isChrome() ? 'auto' : 'smooth',
        block: 'center',
        inline: 'start',
      });
    }));
  }

  async save() {
    this.saving = true;
    this.cdr.markForCheck();
    await this.layout.save();
    this.saving = false;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s?.unsubscribe());
    this.getForm('movie').reset();
    this.getForm('campaign')?.reset();
    this.uploadService.clearQueue();
  }

  addSubToStack(sub: Subscription) {
    this.subs.push(sub);
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
}
