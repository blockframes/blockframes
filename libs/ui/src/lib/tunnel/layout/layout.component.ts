import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy, ContentChild, Inject, TemplateRef, Directive } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep, TunnelStepSnapshot } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormGroup } from '@angular/forms';
import { FORMS_CONFIG, ShellConfig } from '@blockframes/movie/form/shell/shell.component';

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

@Directive({ selector: 'tunnel-confirm-exit' })
export class TunnelExitConfirmDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Component({
  selector: '[exitRedirect] tunnel-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade, routeAnimation],
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
  public ltMd$ = this.breakpointsService.ltMd;

  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;

  @ContentChild('confirmExit') confirmExitTemplate: TunnelExitConfirmDirective;

  @Input() steps: TunnelStep[];

  /** Fallback link to redirect on exit */
  @Input() exitRedirect: string;

  private routeBeforeTunnel: string;

  async redirect() {
    this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }

  private sub: Subscription;

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
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
    this.urlBynav$ = combineLatest([this.url$, new BehaviorSubject(this.steps).asObservable()]).pipe(shareReplay(1))

    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavContent.scrollTo({ top: 0 })
        this.getRoute();
      })
    this.getRoute();
  }

  private getRoute() {
    const url = this.routerQuery.getValue().state.url;
    /*      this.currentStep = getStepSnapshot(this.steps, url);
         this.next = getPage(this.steps, url, 1);
         this.previous = getPage(this.steps, url, -1); */
  }

  /** Save the form and display feedback to user */
  private async save() {
    await this.update(false);
    await this.snackBar.open('Title saved', '', { duration: 1000 }).afterDismissed().toPromise();
    return true;
  }


  private getForm<K extends keyof ShellConfig>(name: K): ShellConfig[K]['form'] {
    return this.configs[name]?.form;
  }


  confirmExit() {
    const isPristine = Object.values(this.configs).every((config: any) => config.form.pristine);
    if (isPristine) {
      return of(true);
    }
    console.log(this.confirmExit)
    const dialogRef = this.dialog.open(this.confirmExitTemplate, {
      width: '80%',
      /*    data: {
           title: 'You are going to leave the Movie Form.',
           subtitle: 'Pay attention, if you leave now your changes will not be saved.'
         } */
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

  /** Update the movie. Used by summaries */
  async update(publishing: boolean) {
    if (publishing) {
      for (const name in this.configs) {
        const form = this.getForm(name as any);
        if (form.invalid) {
          const fields = findInvalidControls(form);
          throw new Error(`Form "${name}" should be valid before publishing. Invalid fields are: ${fields.join()}`);
        }
      }
    }
    for (const name in this.configs) {
      await this.configs[name].onSave(publishing);
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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