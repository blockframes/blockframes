import { Directive, Input, HostBinding, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '../theme/theme.service';

@Directive({
  selector: 'img[asset]'
})
export class AssetDirective implements OnInit, OnDestroy{
  private sub: Subscription;
  // Create a local variable to subscribe to
  private asset$ = new BehaviorSubject('');

  // The "src" property of the img will be associated with that
  @HostBinding('src') src: string;

  @Input() type: 'images' | 'logo' = 'images'

  // Whenever the asset name is provided update the local value
  @Input() set asset(name: string) {
    this.asset$.next(name);
  }

  constructor(private theme: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = combineLatest([this.asset$, this.theme.theme$]).subscribe(([ asset, theme ]) => {
      this.src = `assets/${this.type}/${theme}/${asset}`;
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
