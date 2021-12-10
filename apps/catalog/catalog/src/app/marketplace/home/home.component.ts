import { Observable } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, Component, HostBinding, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CmsPage } from '@blockframes/admin/cms/template';
import { distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { canHavePreferences } from '@blockframes/user/+state/user.utils';
import { createPreferences } from '@blockframes/user/+state';
import { PreferencesComponent } from '@blockframes/auth/pages/preferences/modal/preferences.component';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceHomeComponent implements OnInit, AfterViewInit {
  @HostBinding('test-id="content"') testId
  @ViewChild('banner') banner?: TemplateRef<unknown>;
  @ViewChild('hero') hero?: TemplateRef<unknown>;
  @ViewChild('titles') titles?: TemplateRef<unknown>;
  @ViewChild('slider') slider?: TemplateRef<unknown>;
  @ViewChild('orgs') orgs?: TemplateRef<unknown>;
  @ViewChild('orgTitles') orgTitles?: TemplateRef<unknown>;

  public page$: Observable<CmsPage>;
  public templates: Record<string, TemplateRef<unknown>> = {};
  trackByIndex = (index: number) => index;

  constructor(
    private dynTitle: DynamicTitleService,
    private db: AngularFirestore,
    private dialog: MatDialog,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private orgService: OrganizationService
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.page$ = this.db.doc<CmsPage>('cms/catalog/home/live').valueChanges().pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    if (this.authQuery.user.preferences) return;
    const org = await this.orgService.getValue(this.authQuery.user.orgId);
    if (canHavePreferences(org, 'catalog')) {
      const preferences = createPreferences();
      this.authService.update({ preferences });
      this.dialog.open(PreferencesComponent, {
        height: '80vh',
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
    }
  }
}
