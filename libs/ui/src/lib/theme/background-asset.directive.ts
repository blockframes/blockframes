import { Directive, Input, HostBinding, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '../theme';

@Directive({
  selector: '[backgroundAsset]'
})
export class BackgroundAssetDirective implements OnInit, OnDestroy{
  private sub: Subscription;
  // Create a local variable to subscribe to
  private asset$ = new BehaviorSubject('');

  // The "src" property of the img will be associated with that
  @HostBinding('style.backgroundImage') url: string;

  // Whenever the asset name is provided update the local value
  @Input() set backgroundAsset(name: string) {
    this.asset$.next(name);
  }

  constructor(private theme: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = combineLatest([this.asset$, this.theme.theme$]).subscribe(([ asset, theme ]) => {
      this.url = `url("assets/images/${theme}/${asset}")`;
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
