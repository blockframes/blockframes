import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { CmsService } from '../cms.service';
import { CmsApp } from './app.model';

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
  pages$ = this.route.params.pipe(
    switchMap(params => this.service.doc<CmsApp>(params)),
    map(app => app.pages)
  );
  constructor(
    private service: CmsService,
    private route: ActivatedRoute
  ) { }
}
