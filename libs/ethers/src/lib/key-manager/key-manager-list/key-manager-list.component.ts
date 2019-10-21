import { Component, ChangeDetectionStrategy, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";

import { KeyManagerQuery } from "../+state";
import { Key } from "../../types";

@Component({
  selector: 'key-manager-list',
  templateUrl: './key-manager-list.component.html',
  styleUrls: ['./key-manager-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyManagerListComponent implements OnInit {

  @Input() isSmall = false;
  @Input() ensDomain: string;
  @Output() deleteKey = new EventEmitter<Key>();
  @Output() selectKey = new EventEmitter<Key>();
  @Output() linkKey = new EventEmitter<Key>();

  keys$: Observable<Key[]>;
  linkedKeys$: Observable<Key[]>; // keys that exists inside the erc1077, i.e. keys that can send tx

  constructor(
    private query: KeyManagerQuery,
  ){}

  ngOnInit() {
    this.keys$ = this.query.selectUserKeys$(this.ensDomain);
    this.linkedKeys$ = this.query.selectUserLinkedKeys$(this.ensDomain);
  }
}
