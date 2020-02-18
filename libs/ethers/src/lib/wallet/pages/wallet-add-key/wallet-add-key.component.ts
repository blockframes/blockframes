import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { KeyManagerService, KeyManagerQuery } from '../../../key-manager/+state';
import { WalletQuery } from '../../+state';
import { Key } from '../../../types';

enum steps {
  password,
  import,
  export,
  end
}
@Component({
  selector: 'wallet-add-key-tunnel',
  templateUrl: './wallet-add-key.component.html',
  styleUrls: ['./wallet-add-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletAddKeyTunnelComponent implements OnInit {
  steps = steps;
  step = this.steps.password;
  key: Key;
  encrypting$: Observable<boolean>;
  loadingProgress$: Observable<number>;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef<HTMLAnchorElement>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private walletQuery: WalletQuery,
    private keyQuery: KeyManagerQuery,
    private keyService: KeyManagerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.encrypting$ = this.keyQuery.selectLoading();
    this.loadingProgress$ = this.keyQuery.select('progress');
  }

  async setPassword(password: string) {
    const { ensDomain } = this.walletQuery.getValue();
    const keyName = this.keyService.getDefaultKeyName(ensDomain);
    this.key = await this.keyService.createFromRandom(keyName, ensDomain, password);
    this.step = steps.export;

    // try to trigger an auto-download of the json file
    this.downloadLink.nativeElement.download = this.keyName;
    this.downloadLink.nativeElement.href = <string>this.jsonKeystore(false);
    this.downloadLink.nativeElement.click();
  }

  setKey(key: Key) {
    if (JSON.stringify(this.key) !== JSON.stringify(key)) {
      // object deep equal
      throw new Error(
        `You did not import the good file ! Please import the file named ${this.keyName}`
      );
    }
    this.keyService.storeKey(key);
    delete this.key;
    this.step = steps.end;
  }

  /** create a name for the downloadable file */
  get keyName() {
    return `${this.key.ensDomain}_${this.key.name}.json`;
  }

  /**
   * create a downloadable data blob (json file) from this key
   * @param bypassSecurity `true` = return a SafeResourceUrl, `false` = return a string
   */
  jsonKeystore(bypassSecurity: boolean): SafeResourceUrl | string {
    const data = new Blob([JSON.stringify(this.key)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(data);
    if (bypassSecurity) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url); // regular download link : bypass security to prevent angular from escaping our data
    }
    return url; // for auto-download we have to return a non-bypassed string
  }

  handleRedirect() {
    if (!!this.walletQuery.getValue().tx) {
      this.router.navigateByUrl('/c/o/account/wallet/send');
    } else {
      this.router.navigateByUrl('/c/o/account/wallet');
    }
  }
}
