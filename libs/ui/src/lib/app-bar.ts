import { Directive, Component, TemplateRef, Input, ViewContainerRef, OnDestroy, AfterViewInit, NgModule, HostBinding, NgZone, Inject, ElementRef, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { CommonModule, DOCUMENT } from '@angular/common';
import { trigger, style, transition, animate, query } from '@angular/animations';
import { Easing } from '@blockframes/utils/animations/animation-easing';
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
  animations: [
    trigger('isApp', [
      transition('true => false', [
        style({ position: 'relative', overflow: 'hidden' }),
        query(':leave', style({ position: 'absolute', left: 0, padding: '0 16px' }), { optional: true }),  // padding 16px to match mat-toolbar inner margin
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
  public pageView: TemplatePortal<unknown>;

  @HostBinding('class') _classes = 'mat-toolbar mat-toolbar-single-row';
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
  ) { }

  attach(pageTemplate: TemplateRef<unknown>) {
    this.pageView = new TemplatePortal(pageTemplate, this.containerRef);
  }

  detach() {
    this.isApp = true;
    if (this.pageView && this.pageView.isAttached) {
      this.pageView.detach();
    }
  }
}


@Directive({ selector: '[appContainer] ' })
export class AppContainerDirective {
  private observer: IntersectionObserver;
  container: HTMLElement;
  @Input('appContainer') appBar: AppBarComponent;
  @Output() toggle = new EventEmitter();
  constructor(
    @Inject(DOCUMENT) private document: Document,
    ref: ElementRef,
    zone: NgZone
  ) {
    this.container = ref.nativeElement;

    zone.runOutsideAngular(async () => {
      const heightSize = 80;
      const options = {
        root: this.container,
        rootMargin: `-${heightSize}px 0px 0px 0px`,
        threshold: 0
      }

      // IntersectionObserver isn't supported on Safari older than version 12.2
      if (!('IntersectionObserver' in window)) await import('intersection-observer');

      this.observer = new IntersectionObserver(([entry]) => {
        // First entry artifact (not sure what happens)
        const { x, y, width, height } = entry.rootBounds;
        if (x === 0 && y === 0 && width === 0 && height === 0) {
          return;
        }
        const isLeavingTop = !entry.isIntersecting && entry.boundingClientRect.top <= heightSize;
        const isEnteringTop = !this.appBar.isApp && entry.isIntersecting;
        if (isLeavingTop) {
          zone.run(() => this.appBar.isApp = false);
        } else if (isEnteringTop) {
          zone.run(() => this.appBar.isApp = true);
        }
      }, options);
    });
  }

  observe(targetId: string) {
    // Adding a delay is not optimal but couldn't find the source of the issue.
    // Without the delay, the entry.rootBounds in the observer has value 0 - even though the element does exist.
    // Running inside Angular or removing animations didn't solve the issue.
    setTimeout(() => {
      const el = this.document.getElementById(targetId);
      if (el) this.observer.observe(el);
    }, 800); // 800 gives most consistent result (for me) plus UX is minimally impacted
  }

  unobserve(targetId: string) {
    if (this.observer) {
      const el = this.document.getElementById(targetId);
      this.observer.unobserve(el);
    }
  }
}


@Directive({ selector: '[pageBar]' })
export class PageBarDirective implements AfterViewInit, OnDestroy {
  @Input() targetId: string;
  constructor(
    private appContainer: AppContainerDirective,
    private template: TemplateRef<unknown>,
  ) { }

  async ngAfterViewInit() {
    this.appContainer.appBar.attach(this.template)

    if (this.targetId) {
      this.appContainer.observe(this.targetId);
    } else {
      this.appContainer.appBar.isApp = false;
    }

  }

  ngOnDestroy() {
    this.appContainer.appBar.detach();
    if (this.targetId) {
      this.appContainer.unobserve(this.targetId);
    }
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
  constructor(private appContainer: AppContainerDirective) { }
  toggle() {
    this.appContainer.toggle.emit();
  }
}

@NgModule({
  imports: [CommonModule, PortalModule, MatButtonModule, MatIconModule],
  declarations: [AppBarComponent, AppContainerDirective, PageBarDirective, AppMenuComponent],
  exports: [AppBarComponent, AppContainerDirective, PageBarDirective, AppMenuComponent],
})
export class AppBarModule { }
