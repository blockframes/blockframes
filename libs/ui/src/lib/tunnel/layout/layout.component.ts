import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild,
  OnDestroy,
  ContentChild,
  Inject,
  TemplateRef
} from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep, TunnelStepSnapshot } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent, MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import type { ShellConfig } from '@blockframes/movie/form/movie.shell.interfaces';
import { FORMS_CONFIG } from '@blockframes/movie/form/movie.shell.interfaces';
import { FormSaveOptions } from "@blockframes/utils/common-interfaces";

/**
 * @description returns the next or previous page where the router should go to
 * @param steps all the possible steps
 * @param url current url
 * @param arithmeticOperator plus or minus
 */
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): RouteDescription {
  const allSections = steps.map(({ routes }) => routes);
  const allPath = allSections.flat();
  const currentPath = parseUrlWithoutFragment(url);
  const index = allPath.findIndex(route => route.path === currentPath)
  if (index >= 0) {
    return allPath[index + arithmeticOperator];
  }
}

function parseUrlWithoutFragment(url: string): string {
  return url.includes('#') ? url.split('#')[0].split('/').pop() : url.split('/').pop();
}

function getStepSnapshot(steps: TunnelStep[], url: string): TunnelStepSnapshot {
  const path = parseUrlWithoutFragment(url);
  for (const step of steps) {
    const route = step.routes.find(r => r.path === path);
    if (route) {
      return { ...step, route };
    }
  }
}

@Component({
  selector: '[exitRedirect] tunnel-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade, routeAnimation],
  // eslint-disable-next-line
  host: {
    'class': 'tunnel-layout',
    '[@fade]': 'fade'
  }
})
export class TunnelLayoutComponent implements OnInit, OnDestroy {

  private url$ = this.routerQuery.select('state').pipe(map(({ url }) => url))
  public urlBynav$: Observable<[string, TunnelStep[]]>;
  public currentStep: TunnelStepSnapshot;
  public next: RouteDescription;
  public previous: RouteDescription;
  public mode$ = this.breakpointsService.ltMd.pipe(
    map(ltMd => ltMd ? 'over' : 'side'),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;
  @ViewChild(MatSidenav) sidenav: MatSidenav;

  @ContentChild('confirmExit') confirmExitTemplate: TemplateRef<unknown>

  @Input() steps: TunnelStep[];

  /** Fallback link to redirect on exit */
  @Input() exitRedirect: string;

  private routeBeforeTunnel: string;
  private sub: Subscription;

  redirect() {
    this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }

  constructor(
    private routerQuery: RouterQuery,
    private breakpointsService: BreakpointsService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
  ) { }

  ngOnInit() {
    console.log('la')
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
    this.urlBynav$ = combineLatest([this.url$, new BehaviorSubject(this.steps).asObservable()]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    this.getRoute();

    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavContent.scrollTo({ top: 0 })
        this.getRoute();
      })
  }

  private getRoute() {
    const url = this.routerQuery.getValue().state.url;
    this.currentStep = getStepSnapshot(this.steps, url);
    this.next = getPage(this.steps, url, 1);
    this.previous = getPage(this.steps, url, -1);
  }

  /** Save the form and display feedback to user */
  async save() {
    await this.update({ publishing: false });
    const configs = Object.keys(this.configs)
    await this.snackBar.open(`${configs.map(config => this.configs[config].name).join(' & ')
      } saved`, '', { duration: 1000 }).afterDismissed().toPromise();
    return true;
  }


  private getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name]?.form;
  }

  confirmExit() {
    const isPristine = Object.values(this.configs).every(config => config.form.pristine);
    if (isPristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(this.confirmExitTemplate, {
      width: '80%'
    });
    return dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        /* Undefined means user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false)
        }
        return shouldSave ? this.save() : of(true)
      })
    );
  }

  /** Update the movie. Used by summaries */
  async update(options: FormSaveOptions) {
    if (options.publishing) {
      for (const name in this.configs) {
        const form = this.getForm(name as keyof ShellConfig);
        if (form.invalid) {
          const arrays = findInvalidControls(form);
          const fields = arrays.errorFields.concat(arrays.missingFields);
          throw new Error(`Form "${name}" should be valid before publishing.Invalid fields are: ${fields.join()} `);
        }
      }
    }
    const keys = Object.keys(this.configs);
    await Promise.all(keys.map(key => this.configs[key].onSave(options)));
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

/* Utils function to get the list of invalid form. */
export function findInvalidControls(formToInvestigate: FormGroup | FormArray) {
  const errorFields = [];
  const missingFields = [];
  const recursiveFunc = (form: FormGroup | FormArray, rootControlName?: string) => {

    for (const field in form.controls) {
      const control = form.get(field);

      if (control.invalid) {
        if (control.errors) {
          const isRequired = Object.keys(control.errors).includes('required');
          const name = rootControlName || getName(control);
          if (isRequired) {
            missingFields.push(name);
          } else if (rootControlName) {
            errorFields.push(rootControlName);
          }
        }
      }

      if (control instanceof FormArray || control instanceof FormGroup) {
        missingFields.concat(recursiveFunc(control, getName(control.parent) || getName(control)));
      }
    }

    return {
      errorFields: Array.from(new Set(errorFields)),
      missingFields: Array.from(new Set(missingFields))
    };
  }
  return recursiveFunc(formToInvestigate);
}

/**
 *
 * @param control
 * @returns the name of the control
 */
function getName(control: AbstractControl): string | null {
  const group = control.parent as FormGroup;
  if (!group) return null;
  const name = Object.keys(group.controls).find(key => group.get(key) === control);
  return name;
}
