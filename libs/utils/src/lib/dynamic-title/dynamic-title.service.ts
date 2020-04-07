import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterQuery } from '@datorama/akita-ng-router-store';

const pages = {
  catalog: {
    app: 'Archipel Content',
    section: (section: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  blockframes: {
    app: 'Blockframes',
    section: (section: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  },
  festival: {
    app: 'Festival',
    section: (section: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${section} ${suffix}`;
    },
    entityWithSection: (section: string, titleName: string, showAppName: boolean, appName: string) => {
      const suffix = showAppName ? `- ${appName}` : '';
      return `${titleName} - ${section} ${suffix}`;
    }
  }
}
@Injectable({
  providedIn: 'root'
})
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
      this.setAppName(data.root.data.app)
    })
  }

  private setAppName(name: string) {
    switch (name) {
      case 'catalog':
        this.app = { slug: 'catalog', label: 'Archipel Content' };
        break;
      case 'blockframes':
        this.app = { slug: 'blockframes', label: 'Blockframes' }
        break;
      case 'festival':
        this.app = { slug: 'festival', label: 'Festival' }
        break;
    }
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
