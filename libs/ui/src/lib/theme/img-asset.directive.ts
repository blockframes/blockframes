import { Directive, Input, HostBinding, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ThemeService } from '../theme/theme.service';

const breakpoints = {
  xs: 600,
  lg: 900
}

@Directive({
  selector: 'img[asset]'
})
export class AssetDirective implements OnInit, OnDestroy{
  private sub: Subscription;
  // Create a local variable to subscribe to
  private asset$ = new BehaviorSubject('');

  @HostBinding('srcset') srcset: string;
  @HostBinding('sizes') sizes: string;

  // The "src" property of the img will be associated with that
  @HostBinding('src') src: string;

  @Input() type: 'images' | 'logo' = 'images'
  @Input() size?: string;

  // Whenever the asset name is provided update the local value
  @Input() set asset(name: string) {
    this.asset$.next(name);
  }

  constructor(
    private theme: ThemeService,
    private cdr: ChangeDetectorRef
    ) {}

  ngOnInit() {
    this.sub = combineLatest([this.asset$, this.theme.theme$]).subscribe(([ asset, theme ]) => {
      const baseUrl = `assets/${this.type}/${theme}`;
      this.srcset = Object.keys(breakpoints).map(key => `${baseUrl}/${asset}-${key}.webp ${breakpoints[key]}w`).join(', ');
      this.sizes = Object.keys(breakpoints).map(key=> `(max-width: ${breakpoints[key]}px) ${breakpoints[key]}px`).join(', ');
      console.log(this.srcset)
      console.log(this.sizes)
      this.cdr.markForCheck();
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
