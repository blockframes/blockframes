import { Component, ChangeDetectionStrategy, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";

import { KeyManagerQuery, Key } from "../+state";

@Component({
  selector: 'key-manager-list',
  templateUrl: './key-manager-list.component.html',
  styleUrls: ['./key-manager-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyManagerListComponent implements OnInit {

  @Input() ensDomain: string;
  @Output() deleteKey = new EventEmitter<Key>();

  keys$: Observable<Key[]>;

  constructor(
    private query: KeyManagerQuery,
  ){}

  ngOnInit() {
    this.keys$ = this.query.selectAllKeysOfUser$(this.ensDomain);
  }

  delete(key: Key) {
    this.deleteKey.emit(key);
  }
}
