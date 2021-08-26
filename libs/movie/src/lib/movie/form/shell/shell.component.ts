// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { TunnelRoot, TunnelStep, TunnelLayoutComponent } from '@blockframes/ui/tunnel';
import { FORMS_CONFIG, ShellConfig } from '../movie.shell.interfaces';

// RxJs
import { map, startWith } from 'rxjs/operators';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { ProductionStatus } from '@blockframes/utils/static-model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { isChrome } from '@blockframes/utils/browser/utils';

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
      label: 'Available Versions',
      shouldHide: isStatus(status, ['development'])
    }]
  }, {
    title: 'Promotional Elements',
    icon: 'cloud_upload',
    time: 10,
    routes: [
      {
        path: 'sales-pitch',
        label: 'Sales Pitch',
      }, {
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
  steps$: Observable<TunnelStep[]>;
  exitRoute: string;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private query: MovieQuery,
    private route: RouterQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const subs: Observable<any>[] = Object.values(this.configs).map((config: any) => config.onInit()).flat();
    this.sub = combineLatest(subs).subscribe(() => this.cdr.markForCheck());
    this.exitRoute = `/c/o/dashboard/title/${this.query.getActiveId()}`;

    const appSteps = this.route.getData<TunnelStep[]>('appSteps');
    const movieForm = this.getForm('movie');
    this.steps$ = movieForm.productionStatus.valueChanges.pipe(
      startWith(movieForm.get('productionStatus').value),
      map((productionStatus: ProductionStatus) => getSteps(productionStatus, appSteps))
    );
    const routerSub = this.route.selectFragment().subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);

      el?.scrollIntoView({
        behavior: isChrome() ? 'auto' : 'smooth',
        block: 'center',
        inline: 'start',
      });
    });
    this.sub.add(routerSub);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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
}
