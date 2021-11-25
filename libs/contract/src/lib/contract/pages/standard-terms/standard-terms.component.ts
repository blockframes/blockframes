import { ChangeDetectionStrategy, Component, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'standard-terms',
  templateUrl: './standard-terms.component.html',
  styleUrls: ['./standard-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandardTermsComponent {
  public _pdfLink = '/assets/film-industry.pdf';

  /**
   * Note, viewing the pdf as indicated here has certain limitations.
   * the file musn't weight more than 25mb.
   * This cannot be tested locally as the file to ve viewed must be
   * accessible online. Suggestion, deploy the app to your dev env.
   */
  public get pdfLink() {
    const { protocol, hostname } = window.location;
    const link = `${protocol}${hostname}/${this._pdfLink}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(link);
  }
  constructor(protected sanitizer: DomSanitizer) { }

}

