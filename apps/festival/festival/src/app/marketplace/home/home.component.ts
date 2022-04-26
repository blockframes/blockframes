// Angular
import { Component, OnInit, ChangeDetectionStrategy, HostBinding, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
// RxJs
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { doc, docData, DocumentReference, Firestore } from '@angular/fire/firestore';
import { CmsPage } from '@blockframes/admin/cms/template';
import { AuthService } from '@blockframes/auth/+state';
import { createPreferences } from '@blockframes/model';

// Material
import { MatDialog } from '@angular/material/dialog';
import { PreferencesComponent } from '@blockframes/auth/pages/preferences/modal/preferences.component';
import { OrganizationService } from '@blockframes/organization/+state';
import { canHavePreferences } from '@blockframes/user/+state/user.utils';

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
    private db: Firestore,
    private dialog: MatDialog,
    private authService: AuthService,
    private orgService: OrganizationService
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    const ref = doc(this.db, 'cms/festival/home/live') as DocumentReference<CmsPage>;
    this.page$ = docData<CmsPage>(ref).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    if (this.authService.profile.preferences) return;
    const org = await this.orgService.getValue(this.authService.profile.orgId);
    if (canHavePreferences(org, 'festival')) {
      const preferences = createPreferences();
      this.authService.update({ preferences });
      this.dialog.open(PreferencesComponent, {
        autoFocus: false
      });
    }
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
