import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { shareReplay, distinctUntilChanged, map } from "rxjs/operators";
import { Observable, combineLatest } from "rxjs";

export type Breakpoints = typeof Breakpoints;

@Injectable({ providedIn: 'root' })
export class BreakpointsService {
  // Single media
  xs = this.createBreakpoint([ 'XSmall' ]);
  sm = this.createBreakpoint([ 'Small' ]);
  md = this.createBreakpoint([ 'Medium' ]);
  lg = this.createBreakpoint([ 'Large' ]);
  xl = this.createBreakpoint([ 'XLarge' ]);

  /** Observable that tell whats the current active breakpoint name */
  current: Observable<keyof Breakpoints> = combineLatest([this.xs, this.sm, this.md, this.lg, this.xl]).pipe(
    map(([XSmall, Small, Medium, Large, XLarge]) => {
      if (XSmall) return 'XSmall';
      else if (Small) return 'Small';
      else if (Medium) return 'Medium';
      else if (Large) return 'Large';
      else if (XLarge) return 'XLarge';
      else return 'Large';
    }),
  );

  /**
   * Observable that tell whats the current active breakpoint width in px.
   * The width is defined by the Google's Material Design specs
   * https://material.io/design/layout/responsive-layout-grid.html#breakpoints
   */
  currentWidth = this.current.pipe(
    map(bp => {
      switch(bp) {
        case 'XSmall': return 600;
        case 'Small': return 1024;
        case 'Medium': return 1440;
        default: return 1920;
      }
    })
  );

  // Greater Than
  gtXs = this.createBreakpoint([ 'Small', 'Medium', 'Large', 'XLarge' ]);
  gtSm = this.createBreakpoint([ 'Medium', 'Large', 'XLarge' ]);
  gtMd = this.createBreakpoint([ 'Large', 'XLarge' ]);
  gtLg = this.xl;

  // Lower Than
  ltSm = this.xs;
  ltMd = this.createBreakpoint([ 'XSmall', 'Small' ]);
  ltLg = this.createBreakpoint([ 'XSmall', 'Small', 'Medium' ]);
  ltXl = this.createBreakpoint([ 'XSmall', 'Small', 'Medium', 'Large' ]);

  constructor(private breakpointObserver: BreakpointObserver) {}

  /** Create a breakpoint subscription */
  private createBreakpoint(keys: (keyof Breakpoints)[]): Observable<boolean> {
    const bp = keys.map(key => Breakpoints[key]);
    return this.breakpointObserver.observe(bp).pipe(
      distinctUntilChanged((a, b) => a.matches === b.matches),
      map(result => result.matches),
      shareReplay(), // Multicast with replay
    );
  }
}
