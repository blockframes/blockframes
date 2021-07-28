import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { datastudio } from '@env'

@Component({
  selector: 'crm-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  public dashboardUrl: SafeResourceUrl;

  @Input() dashboard: string;
  @Input() params: Record<string, string>;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() { 
    if (datastudio[this.dashboard]) {
      const url = `https://datastudio.google.com/embed/reporting/${datastudio[this.dashboard]}`;

      if (this.params) {
        const params = JSON.stringify(this.params);
        const encodedParams = encodeURIComponent(params);
        const fullUrl = `${url}?params=${encodedParams}`;
        this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      } else {
        this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    }
  }
}