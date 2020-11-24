import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CmsService } from '../cms.service';
import { CmsTemplate } from '../template/template.model';

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
