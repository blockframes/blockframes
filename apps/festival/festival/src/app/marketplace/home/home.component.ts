// Angular
import { Component, OnInit, ChangeDetectionStrategy, HostBinding, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
// RxJs
import { Observable } from 'rxjs';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AngularFirestore } from '@angular/fire/firestore';

interface PageSection {
  sections: {
    _type: string;
  }
}

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('banner') banner?: TemplateRef<any>;
  @ViewChild('hero') hero?: TemplateRef<any>;
  @ViewChild('titles') titles?: TemplateRef<any>;
  @ViewChild('slider') slider?: TemplateRef<any>;
  @ViewChild('orgs') orgs?: TemplateRef<any>;
  @ViewChild('orgTitles') orgTitles?: TemplateRef<any>;

  @HostBinding('test-id="content"') testId
  public page$: Observable<PageSection>;
  public templates: Record<string, TemplateRef<any>> = {};

  constructor(
    private dynTitle: DynamicTitleService,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.page$ = this.db.doc<PageSection>('cms/festival/home/live').valueChanges();
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
