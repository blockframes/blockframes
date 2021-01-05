// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, AfterViewInit, OnDestroy, InjectionToken, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { TunnelRoot, TunnelStep, TunnelLayoutComponent } from '@blockframes/ui/tunnel';

// RxJs
import { map, startWith } from 'rxjs/operators';
import { Observable, of, Subscription, combineLatest } from 'rxjs';
import { ProductionStatus } from '@blockframes/utils/static-model';
import { EntityControl, FormEntity } from '@blockframes/utils/form';
import type { MovieShellConfig } from '../movie.shell.config';
import type { CampaignShellConfig } from '@blockframes/campaign/form/campaign.shell.config';
import { RouterQuery } from '@datorama/akita-ng-router-store';


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
      label: 'Selection & Reviews',
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
      path: 'available-materials',
      label: 'Available Materials',
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

export interface FormShellConfig<Control extends EntityControl<Entity>, Entity> {
  form: FormEntity<Control, Entity>;
  onInit(): Observable<any>[];
  onSave(publishing: boolean): Promise<any>
}

export interface ShellConfig {
  movie: MovieShellConfig;
  campaign?: CampaignShellConfig
}

export const FORMS_CONFIG = new InjectionToken<ShellConfig>('List of form managed by the shell');

@Component({
  selector: 'movie-form-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShellComponent implements TunnelRoot, OnInit, AfterViewInit, OnDestroy {
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
    const subs: Observable<any>[] = Object.values(this.configs).map(config => config.onInit()).flat();
    this.sub = combineLatest(subs).subscribe(() => this.cdr.markForCheck());
    this.exitRoute = `/c/o/dashboard/title/${this.query.getActiveId()}`;
  }

  ngAfterViewInit() {
    const appSteps = this.route.getData<TunnelStep[]>('appSteps');
    const movieForm = this.getForm('movie');
    this.steps$ = movieForm.get('productionStatus').valueChanges.pipe(
      startWith(movieForm.get('productionStatus').value),
      map((productionStatus: ProductionStatus) => getSteps(productionStatus, appSteps))
    );
    const routerSub = this.route.selectFragment().subscribe(async (fragment: string) => {
      const el: HTMLElement = await this.checkIfElementIsReady(fragment);
      el?.scrollIntoView({
        behavior: 'smooth',
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
    return new Promise<HTMLElement>((resolve, rej) => {
      const el = this.doc.getElementById(id);
      if (el) resolve(el);
      new MutationObserver((_, observer) => {
        resolve(this.doc.getElementById(id));
      }).observe(this.doc.documentElement, { childList: true, subtree: true });
    });
  }
}
