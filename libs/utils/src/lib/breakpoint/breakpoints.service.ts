import { Injectable } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { shareReplay, distinctUntilChanged, map } from "rxjs/operators";
import { Observable } from "rxjs";

type Breakpoints = typeof Breakpoints;

@Injectable({ providedIn: 'root' })
export class BreakpointsService {
  // Single media
  xs = this.creatBreakpoint([ 'XSmall' ]);
  sm = this.creatBreakpoint([ 'Small' ]);
  md = this.creatBreakpoint([ 'Medium' ]);
  lg = this.creatBreakpoint([ 'Large' ]);
  xl = this.creatBreakpoint([ 'XLarge' ]);

  // Greater Than
  gtXs = this.creatBreakpoint([ 'Small', 'Medium', 'Large', 'XLarge' ]);
  gtSm = this.creatBreakpoint([ 'Medium', 'Large', 'XLarge' ]);
  gtMd = this.creatBreakpoint([ 'Large', 'XLarge' ]);
  gtLg = this.xl;

  // Lower Than
  ltSm = this.xs;
  ltMd = this.creatBreakpoint([ 'XSmall', 'Small' ]);
  ltLg = this.creatBreakpoint([ 'XSmall', 'Small', 'Medium' ]);
  ltXl = this.creatBreakpoint([ 'XSmall', 'Small', 'Medium', 'Large' ]);

  constructor(private breakpointObserver: BreakpointObserver) {}

  /** Create a breakpoint subscription */
  private creatBreakpoint(keys: (keyof Breakpoints)[]): Observable<boolean> {
    const bp = keys.map(key => Breakpoints[key]);
    return this.breakpointObserver.observe(bp).pipe(
      distinctUntilChanged((a, b) => a.matches === b.matches),
      map(result => result.matches),
      shareReplay(), // Multicast with replay
    );
  }
}
