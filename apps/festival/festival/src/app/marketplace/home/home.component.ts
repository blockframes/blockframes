import { Component, OnInit, ChangeDetectionStrategy, HostBinding, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { DocumentReference } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';

// RxJs
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CmsPage } from '@blockframes/admin/cms/template';

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('banner') banner?: TemplateRef<unknown>;
  @ViewChild('hero') hero?: TemplateRef<unknown>;
  @ViewChild('titles') titles?: TemplateRef<unknown>;
  @ViewChild('slider') slider?: TemplateRef<unknown>;
  @ViewChild('orgs') orgs?: TemplateRef<unknown>;
  @ViewChild('orgTitles') orgTitles?: TemplateRef<unknown>;
  @ViewChild('eventsSlider') eventsSlider?: TemplateRef<unknown>;

  @HostBinding('test-id="content"') testId
  public page$: Observable<CmsPage>;
  public templates: Record<string, TemplateRef<unknown>> = {};


  constructor(
    private dynTitle: DynamicTitleService,
    private firestore: FirestoreService,
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    const ref = this.firestore.getRef('cms/festival/home/live') as DocumentReference<CmsPage>;
    this.page$ = fromRef(ref).pipe(
      map(snap => snap.data()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  ngAfterViewInit() {
    this.templates = {
      banner: this.banner,
      hero: this.hero,
      titles: this.titles,
      slider: this.slider,
      orgs: this.orgs,
      orgTitles: this.orgTitles,
      eventsSlider: this.eventsSlider
    }
  }
}
