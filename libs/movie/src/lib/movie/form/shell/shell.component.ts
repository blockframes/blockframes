// Angular
import { Component, ChangeDetectionStrategy, OnInit, Inject, AfterViewInit, OnDestroy, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state';
import { TunnelRoot, TunnelConfirmComponent, TunnelStep } from '@blockframes/ui/tunnel';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { switchMap, map, startWith } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ProductionStatus } from '@blockframes/utils/static-model';
import { EntityControl, FormEntity } from '@blockframes/utils/form';
import type { MovieShellConfig } from '../movie.shell.config';
import type { CampaignShellConfig } from '@blockframes/campaign/form/campaign.shell.config';
import { RouterQuery } from '@datorama/akita-ng-router-store';


function isStatus(prodStatusCtrl: FormControl, acceptableStatus: ProductionStatus[]) {
  return prodStatusCtrl.valueChanges.pipe(
    startWith(prodStatusCtrl.value),
    map(prodStatus => acceptableStatus.includes(prodStatus))
  )
}

function getSteps(statusCtrl: FormControl, appSteps: TunnelStep[] = []): TunnelStep[] {
  return [{
    title: 'First Step',
    icon: 'home',
    time: 2,
    routes: [{ path: 'title-status', label: 'First Step' }],
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
      shouldDisplay: isStatus(statusCtrl, ['released'])
    }, {
      path: 'technical-spec',
      label: 'Technical Specification'
    }, {
      path: 'available-materials',
      label: 'Available Materials',
      shouldDisplay: isStatus(statusCtrl, ['development'])
    }]
  }, {
    title: 'Promotional Elements',
    icon: 'import',
    time: 10,
    routes: [
      {
        path: 'sales-pitch',
        label: 'Sales Pitch',
        shouldDisplay: isStatus(statusCtrl, ['released'])
      }, {
        path: 'media-files',
        label: 'Files'
      }, {
        path: 'media-notes',
        label: 'Notes & Statements',
        shouldDisplay: isStatus(statusCtrl, ['post_production', 'finished', 'released'])
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
    title: 'Summary',
    icon: 'send',
    time: 3,
    routes: [{
      path: 'summary',
      label: 'Summary & Submission'
    }]
  }]
}



export interface FormSaveOptions {
  publishing: boolean;
}

export interface FormShellConfig<Control extends EntityControl<Entity>, Entity> {
  form: FormEntity<Control, Entity>;
  onInit(): Subscription[];
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
  private sub: Subscription[] = [];
  steps: TunnelStep[];
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
    for (const form in this.configs) {
      const formSubs = this.configs[form].onInit();
      this.sub.concat(formSubs);
    }
    const appSteps = this.route.getData<TunnelStep[]>('appSteps');
    const movieForm = this.getForm('movie');
    this.steps = getSteps(movieForm.get('productionStatus'), appSteps);
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
    this.sub.push(routerSub);
  }

  ngOnDestroy() {
    this.sub.forEach(sub => sub.unsubscribe());
  }

  getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name].form;
  }

  private checkIfElementIsReady(id: string) {
    return new Promise<HTMLElement>((resolve, _) => {
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
      for (const key in this.configs) {
        const form: FormEntity<any> = this.getForm(key as any);
        if (form.invalid) {
          const fields = findInvalidControls(form);
          throw new Error(`Form "${key}" should be valid before publishing. Invalid fields are: ${fields.join()}`);
        }
      }
    }
    for (const form in this.configs) {
      await this.configs[form].onSave(options);
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
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control.invalid) {
        fields.push(field);
      }
      if (control instanceof FormArray || control instanceof FormGroup) {
        fields.concat(recursiveFunc(control));
      }
    });
    return fields;
  }
  return recursiveFunc(formToInvestigate);
}