import { Component, OnInit, ChangeDetectionStrategy, HostBinding, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { DocumentReference } from 'firebase/firestore';
import { FirestoreService, fromRef } from 'ngfire';

// RxJs
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CmsPage } from '@blockframes/admin/cms/template';
import { AuthService } from '@blockframes/auth/service';
import { createPreferences, canHavePreferences } from '@blockframes/model';
import { PreferencesComponent } from '@blockframes/auth/pages/preferences/modal/preferences.component';
import { OrganizationService } from '@blockframes/organization/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private dialog: MatDialog,
    private authService: AuthService,
    private orgService: OrganizationService,
    private firestore: FirestoreService,
    private snackbar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    const ref = this.firestore.getRef('cms/festival/home/live') as DocumentReference<CmsPage>;
    this.page$ = fromRef(ref).pipe(
      map(snap => snap.data()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    if (this.authService.profile.preferences) return;
    const org = await this.orgService.getValue(this.authService.profile.orgId);
    if (canHavePreferences(org, 'festival')) {
      const dialogRef = this.dialog.open(PreferencesComponent, { data: createModalData({}, 'large'), autoFocus: false });
      dialogRef.afterClosed().subscribe((action: string) => {
        if (action === 'dismiss') {
          const preferences = createPreferences();
          this.authService.update({ preferences });
        }
        if (action !== 'saved') {
          this.snackbar.openFromComponent(SnackbarLinkComponent, {
            data: {
              message: 'You can fill in your buyer preferences later.',
              link: ['/c/o/account/profile/view/preferences'],
              linkName: 'TAKE ME THERE'
            },
            duration: 8000
          });
        }
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
