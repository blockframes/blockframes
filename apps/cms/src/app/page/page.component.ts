import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CmsTemplate } from '@blockframes/admin/cms';
import { CmsService } from '../cms.service';

@Component({
  selector: 'cms-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent {

  templates$ = this.route.params.pipe(
    switchMap(params => this.service.collection<CmsTemplate>(params))
  );

  constructor(
    private service: CmsService,
    private route: ActivatedRoute
  ) {}
}
