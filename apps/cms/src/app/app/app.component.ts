import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

const pages = {
  festival: ['homepage'],
}

@Component({
  selector: 'cms-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  pages$ = this.route.params.pipe(map(params => pages[params.app] || []));
  constructor(private route: ActivatedRoute) { }
}
