import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PLACEHOLDER_LOGO } from 'libs/organization/src/lib/+state/organization.model';

@Component({
  selector: 'avatar-list',
  templateUrl: './avatar-list.component.html',
  styleUrls: ['./avatar-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarListComponent {

  _urls: string[];
  _refs: string[];
  _moreDetails = 0;

  @Input()
  set urls(newUrls: string[]) {
    this._urls = [];
    for(let i = 0 ; i < Math.min(2, newUrls.length) ; i++) {
      this._urls.push(newUrls[i]);
    }
    const more = newUrls.length - 2;
    if (more > 0) {
      this._moreDetails = more;
    }
  }

  @Input()
  set refs(newRefs: string[]) {
    this._refs = [];
    for(let i = 0 ; i < Math.min(2, newRefs.length) ; i++) {
      this._refs.push(newRefs[i]);
    }
    const more = newRefs.length - 2;
    if (more > 0) {
      this._moreDetails = more;
    }
  }

  public placeholderLogo = PLACEHOLDER_LOGO;
}
