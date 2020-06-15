import { Directive, Component, TemplateRef, Input, ViewContainerRef, OnDestroy, AfterViewInit, NgModule, HostBinding, NgZone, Inject, ElementRef, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { CommonModule, DOCUMENT } from '@angular/common';
import { trigger, style, transition, animate, query } from '@angular/animations';
import { Easing } from '@blockframes/utils/animations/animation-easing';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bar',
  template: `
    <ng-container *ngIf="isApp; else app">
      <ng-content></ng-content>
    </ng-container>
    <ng-template #app>
      <ng-template [cdkPortalOutlet]="pageView"></ng-template>
    </ng-template>
  `,
  host: {
    class: 'mat-toolbar mat-toolbar-single-row'
  },
  animations: [
    trigger('isApp', [
      transition('true => false', [
        style({ position: 'relative', overflow: 'hidden' }),
        query(':leave', style({ position: 'absolute', left: 0, padding: '0 16px'  }), { optional: true }),  // padding 16px to match mat-toolbar inner margin
        query(':enter', style({ opacity: 0, transform: 'translateY(80px) scale(0.95)' })),
        query(':leave', animate(`300ms ${Easing.easeInCirc}`, style({ opacity: 0, transform: 'translateY(-80px) scale(0.95)' })), { optional: true }),
        query(':enter', animate(`300ms ${Easing.easeOutCirc}`, style({ opacity: 1, transform: 'translateY(0)' })))
      ]),
      transition('false => true', [
        style({ position: 'relative', overflow: 'hidden' }),
        query(':leave', style({ position: 'absolute', left: 0, padding: '0 16px' }), { optional: true }),  // padding 16px to match mat-toolbar inner margin
        query(':enter', style({ opacity: 0, transform: 'translateY(-80px) scale(0.95)' })),
        query(':leave', animate(`300ms ${Easing.easeInCirc}`, style({ opacity: 0, transform: 'translateY(80px) scale(0.95)' })), { optional: true }),
        query(':enter', animate(`300ms ${Easing.easeOutCirc}`, style({ opacity: 1, transform: 'translateY(0)' })))
      ])
    ])
  ]
})
export class AppBarComponent {
  private _isApp = true;
  public pageView: TemplatePortal<any>;

  @HostBinding('@isApp')
  set isApp(isApp: boolean) {
    this._isApp = isApp;
    this.cdr.markForCheck();
  }
  get isApp() {
    return this._isApp;
  }

  constructor(
    private containerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef,
  ) {}

  attach(pageTemplate: TemplateRef<any>) {
    this.pageView = new TemplatePortal(pageTemplate, this.containerRef);
  }

  detach() {
    this.isApp = true;
    if (this.pageView && this.pageView.isAttached) {
      this.pageView.detach();
    }
  }
}


@Directive({ selector: '[appContainer] '})
export class AppContainerDirective {
  container: HTMLElement;
  @Input('appContainer') appBar: AppBarComponent;
  @Output() toggle = new EventEmitter();
  constructor(ref: ElementRef) {
    this.container = ref.nativeElement;
  }
}


@Directive({ selector: '[pageBar]' })
export class PageBarDirective implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver;
  public isVisible$: Observable<boolean>;
  @Input() targetId: string;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private appContainer: AppContainerDirective,
    private template: TemplateRef<any>,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.appContainer.appBar.attach(this.template)
    if (this.targetId) {
      this.zone.runOutsideAngular(() => {
        const heightSize = 80;
        const options = {
          root: this.appContainer.container,
          rootMargin: `-${heightSize}px 0px 0px 0px`,
          threshold: 0
        }
        this.observer = new IntersectionObserver(([entry]) => {
          // First entry artifact (not sure what happens)
          const {x, y, width, height} = entry.rootBounds;
          if (x === 0 && y === 0 && width === 0 && height === 0) {
            return;
          }
          const isLeavingTop = !entry.isIntersecting && entry.boundingClientRect.top <= heightSize;
          const isEnteringTop = !this.appContainer.appBar.isApp && entry.isIntersecting;
          if (isLeavingTop) {
            this.zone.run(() => this.appContainer.appBar.isApp = false);
          } else if (isEnteringTop) {
            this.zone.run(() => this.appContainer.appBar.isApp = true);
          }
        }, options);
        this.observer.observe(this.targetEl);
      })
    } else {
      this.appContainer.appBar.isApp = false;
    }

  }

  ngOnDestroy() {
    this.appContainer.appBar.detach();
    if (this.targetId && this.observer) {
      this.observer.unobserve(this.targetEl);
    }
  }

  // Use getElementById because target is sybling & cannot cast input into an ElementRef
  get targetEl() {
    return this.document.getElementById(this.targetId);
  }
}

@Component({
  selector: 'app-menu',
  template: `
    <button test-id="menu" mat-icon-button (click)="toggle()">
      <mat-icon svgIcon="menu"></mat-icon>
    </button>
  `
})
export class AppMenuComponent {
  constructor(private appContainer: AppContainerDirective) {}
  toggle() {
    this.appContainer.toggle.emit();
  }
}

@NgModule({
  imports: [CommonModule, PortalModule, MatButtonModule, MatIconModule],
  declarations: [AppBarComponent, AppContainerDirective, PageBarDirective, AppMenuComponent],
  exports: [AppBarComponent, AppContainerDirective, PageBarDirective, AppMenuComponent],
})
export class AppBarModule {}
