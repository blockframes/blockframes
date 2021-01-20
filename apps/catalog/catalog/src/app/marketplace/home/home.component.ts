import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, HostBinding, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CmsPage } from '@blockframes/admin/cms/template';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceHomeComponent implements OnInit {
  @HostBinding('test-id="content"') testId
  @ViewChild('banner') banner?: TemplateRef<any>;
  @ViewChild('hero') hero?: TemplateRef<any>;
  @ViewChild('titles') titles?: TemplateRef<any>;
  @ViewChild('slider') slider?: TemplateRef<any>;
  @ViewChild('orgs') orgs?: TemplateRef<any>;
  @ViewChild('orgTitles') orgTitles?: TemplateRef<any>;

  public page$: Observable<CmsPage>;
  public templates: Record<string, TemplateRef<any>> = {};
  trackByIndex = (index: number) => index;

  constructor(
    private dynTitle: DynamicTitleService,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.page$ = this.db.doc<CmsPage>('cms/catalog/home/live').valueChanges();
  }

  ngAfterViewInit() {
    this.templates = {
      banner: this.banner,
      hero: this.hero,
      titles: this.titles,
      slider: this.slider,
      orgs: this.orgs,
      orgTitles: this.orgTitles,
    }
  }
}
