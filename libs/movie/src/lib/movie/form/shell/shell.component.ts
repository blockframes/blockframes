// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, AfterViewInit, OnDestroy, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormArray, FormGroup } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { TunnelRoot, TunnelConfirmComponent, TunnelStep } from '@blockframes/ui/tunnel';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { switchMap, map, startWith } from 'rxjs/operators';
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
      label: 'Selection & Reviews'
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
    icon: 'import',
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

export interface FormSaveOptions {
  publishing: boolean;
}

export interface FormShellConfig<Control extends EntityControl<Entity>, Entity> {
  form: FormEntity<Control, Entity>;
  onInit(): Observable<any>[];
  onSave(options: FormSaveOptions): Promise<any>
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
  private sub: Subscription;
  steps$: Observable<TunnelStep[]>;
  exitRoute: string;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private query: MovieQuery,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: RouterQuery,
  ) { }

  ngOnInit() {
    const subs: Observable<any>[] = Object.values(this.configs).map(config => config.onInit()).flat();
    this.sub = combineLatest(subs).subscribe();
    const appSteps = this.route.getData<TunnelStep[]>('appSteps');
    const movieForm = this.getForm('movie');
    this.steps$ = movieForm.get('productionStatus').valueChanges.pipe(
      startWith(movieForm.get('productionStatus').value),
      map((productionStatus: ProductionStatus) => getSteps(productionStatus, appSteps))
    );
    this.exitRoute = `/c/o/dashboard/title/${this.query.getActiveId()}`;
  }

  ngAfterViewInit() {
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
    if (this.configs[name]) {
      this.getForm('campaign').reset();
    }
  }

  getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name].form;
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

  /** Update the movie. Used by summaries */
  public async update(options: FormSaveOptions) {
    if (options.publishing) {
      for (const name in this.configs) {
        const form: FormEntity<any> = this.getForm(name as any);
        if (form.invalid) {
          const fields = findInvalidControls(form);
          throw new Error(`Form "${name}" should be valid before publishing. Invalid fields are: ${fields.join()}`);
        }
      }
    }
    for (const name in this.configs) {
      await this.configs[name].onSave(options);
    }
  }

  /** Save the form and display feedback to user */
  public async save() {
    await this.update({ publishing: false });
    await this.snackBar.open('Title saved', '', { duration: 500 }).afterDismissed().toPromise();
    return true;
  }

  confirmExit() {
    const isPristine = Object.values(this.configs).every(config => config.form.pristine);
    if (isPristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        /* Undefined means, user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false)
        }
        return shouldSave ? this.save() : of(true)
      })
    );
  }
}

/* Utils function to get the list of invalid form. Not used yet, but could be useful later */
export function findInvalidControls(formToInvestigate: FormGroup | FormArray) {
  const recursiveFunc = (form: FormGroup | FormArray) => {
    const fields = [];
    for (const field in form.controls) {
      const control = form.get(field);
      if (control.invalid) {
        fields.push(field);
      }
      if (control instanceof FormArray || control instanceof FormGroup) {
        fields.concat(recursiveFunc(control));
      }
    }
    return fields;
  }
  return recursiveFunc(formToInvestigate);
}