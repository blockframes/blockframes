// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterQuery } from '@datorama/akita-ng-router-store';

// Blockframes
import { TunnelRoot, TunnelStep, TunnelLayoutComponent } from '@blockframes/ui/tunnel';
import { FORMS_CONFIG, ShellConfig } from '../movie.shell.interfaces';
import { ProductionStatus } from '@blockframes/utils/static-model';
import { isChrome } from '@blockframes/utils/browser/utils';

// RxJs
import { map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

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
      }, {
        path: 'media-notes',
        label: 'Notes & Statements',
        shouldHide: isStatus(status, ['post_production', 'finished', 'released'])
      },
      {
        path: 'media-images',
        label: 'Images'
      }, {
        path: 'media-videos',
        label: 'Videos'
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
  private sub: Subscription;

  private loaded$ = new BehaviorSubject<void>(this.initForms());

  private productionStatus$: Observable<ProductionStatus> = this.loaded$.pipe(
    switchMap(() => this.getForm('movie').productionStatus.valueChanges),
    startWith(this.getForm('movie').productionStatus.value),
    tap((productionStatus: ProductionStatus) => this.configs.movie.fillHiddenMovieInputs(productionStatus)),
  );

  steps$: Observable<TunnelStep[]> = this.productionStatus$.pipe(
    map((productionStatus: ProductionStatus) => getSteps(productionStatus, this.routerQuery.getData<TunnelStep[]>('appSteps'))),
  );

  exitRoute$: Observable<string> = this.route.params.pipe(
    pluck('movieId'),
    map((movieId: string) => `/c/o/dashboard/title/${movieId}`)
  );

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private routerQuery: RouterQuery,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.sub = this.routerQuery.selectFragment().subscribe(async (fragment: string) => {
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
    this.getForm('movie').reset();
    this.getForm('campaign')?.reset();
  }

  initForms() {
    this.configs.movie.onInit();
    this.configs.campaign?.onInit();
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
