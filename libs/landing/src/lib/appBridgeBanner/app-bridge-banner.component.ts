import { Component, ChangeDetectionStrategy, HostBinding, Inject } from '@angular/core';
import { App, applicationUrl } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

interface AppBridge {
  name: string;
  subtitle: string;
  logo: string;
  link: string;
};
type BridgeRecord = Partial<Record<App, AppBridge>>;

@Component({
  selector: 'app-bridge-banner',
  templateUrl: './app-bridge-banner.component.html',
  styleUrls: ['./app-bridge-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppBridgeBannerComponent {
  @HostBinding('class') class = 'dark-contrast-theme';

  public currentApp = this.app;
  public bridgeApp = this.currentApp === 'festival' ? 'catalog' : 'festival';
  public buttonsData: BridgeRecord = {
    festival: {
      name: 'Archipel Market',
      subtitle: 'The Ongoing Film Market',
      logo: 'mini_logo_festival',
      link: applicationUrl.festival
    },
    catalog: {
      name: 'Archipel Content',
      subtitle: 'The Content Marketplace',
      logo: 'mini_logo_catalog',
      link: applicationUrl.catalog
    }
  };

  constructor(
    @Inject(APP) private app: App,
  ) {}

  scrollToHeader() {
    document.getElementById("header-to-scroll").scrollIntoView({behavior: "smooth"});
  }
}
