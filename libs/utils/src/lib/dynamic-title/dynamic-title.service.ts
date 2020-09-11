import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getAppName, appName, App } from '../apps';

type PageKey = App | 'crm' | 'blockframes';

const pages: Record<PageKey, any> = {
  catalog: {
    app: appName.catalog,
    section: (section: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  blockframes: {
    app: appName.blockframes,
    section: (section: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  festival: {
    app: appName.festival,
    section: (section: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  financiers: {
    app: appName.financiers,
    section: (section: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  crm: {
    app: appName.crm,
    section: (section: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, _appName: string) => {
      const suffix = showAppName ? `- ${_appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  }
}
@Injectable({ providedIn: 'root' })
export class DynamicTitleService implements OnDestroy {
  private app: SlugAndLabel;

  private sub: Subscription;

  /**
   * This variable holds the value that this service gets when 
   * he gets initialized. This is useful as a fallback option 
   */
  private initTitle = '';

  private pages: Record<string, any> = pages;

  constructor(private title: Title, private routerQuery: RouterQuery) {
    this.sub = this.routerQuery.select('state').subscribe(data => {
      this.app = getAppName(data.root.data.app);
    })
  }


  /**
   * @description
   * @param section can be the name of a tab or a filter
   * @param entityWithSection can be movie title name
   * @param config.appName by default it uses the ActivatedRoute interface to determine the app name,
   * but this name can be overwritten
   * @param config.showAppName determines if the app name should be shown in the tab, default is set to true
   */
  public setPageTitle(section?: string, entityWithSection?: string, config = { appName: this.app, showAppName: true }) {
    if (entityWithSection && section) {
      this.title.setTitle(this.pages[config.appName.slug].entityWithSection(entityWithSection, section, config.showAppName, config.appName.label));
      if (!this.initTitle) {
        this.initTitle = this.pages[config.appName.slug].entityWithSection(entityWithSection, section, config.showAppName, config.appName.label);
      }
    } else if (section) {
      this.title.setTitle(this.pages[config.appName.slug].section(section, config.showAppName, config.appName.label))
      if (!this.initTitle) {
        this.initTitle = this.pages[config.appName.slug].section(section, config.showAppName, config.appName.label)
      }
    } else {
      this.title.setTitle(this.pages[config.appName.slug].app)
      if (!this.initTitle) {
        this.initTitle = this.pages[config.appName.slug].app
      }
    }
  }

  public useDefault() {
    this.title.setTitle(this.initTitle);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
