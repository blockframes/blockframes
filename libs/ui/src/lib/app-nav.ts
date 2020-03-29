import { Directive, Input, ElementRef, OnDestroy, NgModule, Component, NgZone, ContentChild, Inject, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Directive({ selector: '[pageNavTarget]' })
export class PageNavTargetDirective {}

@Component({
  selector: 'app-nav',
  template: `<div *ngIf="visible$ | async" @nav><ng-content></ng-content></div>`,
  styles: [':host { position: fixed; width: 100%; top: 0; z-index: 2; display: block; }'],
  animations: [
    trigger('visible', [
      state('false', style({ transform: 'translateY(50%) rotateX(90deg)' })),
      transition('false <=> true', animate(200))
    ]),
    trigger('nav', [
      transition(':enter', [
        style({ transform: 'translateY(50%) rotateX(90deg)' }),
        animate(200)
      ]),
      transition(':leave', [
        animate(200, style({ transform: 'translateY(50%) rotateX(90deg)' }))
      ])
    ])
  ]
})
export class AppNavComponent {
  public visible$ = new BehaviorSubject(true);
  get isVisible() {
    return this.visible$.getValue();
  }
  constructor(private el: ElementRef<HTMLElement>) {}
  get height() {
    return this.el.nativeElement.clientHeight;
  }
  show() {
    this.visible$.next(true);
  }
  hide() {
    this.visible$.next(false);
  }
}

@Directive({ selector: '[appNavContainer]' })
export class AppNavContainerDirective {
  @Input() appNav: AppNavComponent;
  container: HTMLElement;

  constructor(ref: ElementRef) {
    this.container = ref.nativeElement;
  }
}


@Component({
  selector: 'page-nav',
  template: `<div *ngIf="isVisible$ | async" @nav><ng-content></ng-content></div>`,
  styles: [':host { position: fixed; width: 100%; top: 0; z-index: 2; display: block; }'],
  animations: [
    trigger('nav', [
      transition(':enter', [
        style({ transform: 'translateY(-50%) rotateX(-90deg)' }),
        animate(200)
      ]),
      transition(':leave', [
        animate(200, style({ transform: 'translateY(-50%) rotateX(-90deg)' }))
      ])
    ])
  ]
})
export class PageNavComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver;
  public isVisible$: Observable<boolean>;
  @Input() targetId: string;
  @ContentChild(PageNavTargetDirective) _target: PageNavTargetDirective
  constructor(
    private appContainer: AppNavContainerDirective,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    this.isVisible$ = this.appContainer.appNav.visible$.pipe(map(appNavIsVisbible => !appNavIsVisbible));
    if (!this.targetId) {
      return this.appContainer.appNav.hide();
    }
    this.zone.runOutsideAngular(() => {
      const height = this.appContainer.appNav.height || 0;
      const options = {
        root: this.appContainer.container,
        rootMargin: `-${height}px 0px 0px 0px`,
        threshold: 0
      }
      this.observer = new IntersectionObserver(([entry]) => {
        const isLeavingTop = !entry.isIntersecting && entry.intersectionRect.top <= height;
        const isEnteringTop = !this.appContainer.appNav.isVisible && entry.isIntersecting;
        if (isLeavingTop) {
          this.zone.run(() => this.appContainer.appNav.hide());
        } else if (isEnteringTop) {
          this.zone.run(() => this.appContainer.appNav.show());
        }
      }, options);
      this.observer.observe(this.targetEl);
    })
  }

  ngOnDestroy() {
    this.observer.unobserve(this.targetEl);
  }

  // Use getElementById because target is sybling & cannot cast input into an ElementRef
  get targetEl() {
    return this.document.getElementById(this.targetId);
  }

}





@NgModule({
  imports: [CommonModule],
  declarations: [AppNavContainerDirective, PageNavComponent, AppNavComponent, PageNavTargetDirective],
  exports: [AppNavContainerDirective, PageNavComponent, AppNavComponent, PageNavTargetDirective]
})
export class AppNavModule {}