import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { shareReplay, distinctUntilChanged, map } from "rxjs/operators";
import { Observable } from "rxjs";

export type Breakpoints = typeof Breakpoints;

@Injectable({ providedIn: 'root' })
export class BreakpointsService {
  // Single media
  xs = this.createBreakpoint([ 'XSmall' ]);
  sm = this.createBreakpoint([ 'Small' ]);
  md = this.createBreakpoint([ 'Medium' ]);
  lg = this.createBreakpoint([ 'Large' ]);
  xl = this.createBreakpoint([ 'XLarge' ]);

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
