import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { appName } from '../apps';
import { AppGuard } from '../routes/app.guard';

function displaySection(section: string, showAppName: boolean, _appName: string) {
  const suffix = showAppName ? `- ${_appName}` : '';
  return `${section} ${suffix}`;
}

function displayEntityWithSection(section: string, titleName: string, showAppName: boolean, _appName: string) {
  const suffix = showAppName ? `- ${_appName}` : '';
  return `${titleName} - ${section} ${suffix}`;
}

@Injectable({ providedIn: 'root' })
export class DynamicTitleService {
  private app = this.appGuard.currentApp;

  /**
   * This variable holds the value that this service gets when
   * he gets initialized. This is useful as a fallback option
   */
  private initTitle = '';

  constructor(private title: Title, private appGuard: AppGuard) { }

  /**
   * @description
   * @param section can be the name of a tab or a filter
   * @param entityWithSection can be movie title name
   * @param config.appName by default it uses the ActivatedRoute interface to determine the app name,
   * but this name can be overwritten
   * @param config.showAppName determines if the app name should be shown in the tab, default is set to true
   */
  public setPageTitle(section?: string, entityWithSection?: string) {
    const app = appName[this.app];
    let title: string;
    if (entityWithSection && section) {
      title = displayEntityWithSection(entityWithSection, section, true, app);
    } else if (section) {
      title = displaySection(section, true, app);
    } else {
      title = app;
    }
    this.title.setTitle(title);
    if (!this.initTitle) {
      this.initTitle = title;
    }
  }

  public useDefault() {
    this.title.setTitle(this.initTitle);
  }
}
