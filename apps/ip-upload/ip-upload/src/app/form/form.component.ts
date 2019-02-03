import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpHashContract, IP_TYPES, IpService } from '@blockframes/ip';
import { utils } from 'ethers';
import { User, AuthQuery } from '@blockframes/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ip-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  public user: User;
  public form: FormGroup;
  public types = IP_TYPES;

  constructor(
    private service: IpService,
    private auth: AuthQuery,
    private snackBar: MatSnackBar,
    private contract: IpHashContract,
    private builder: FormBuilder
  ) {}

  ngOnInit() {
    this.user = this.auth.user;
    this.form = this.builder.group({
      'title': ['', [Validators.required]],
      'synopsis': [''],
      'version': ['', [Validators.required]],
      'genres': this.builder.array([]),
      'type': [''],
      'authors': this.builder.array([ this.createAuthor() ]),
      'fileUrl': [''],
      'ipHash': [''],
      'txHash': [''],
      'date': [''],
      'signer': [''],
      'isan': ['']
    });
  }

  public createAuthor() {
    return this.builder.group({
      'firstName': ['', [Validators.required]],
      'lastName': ['', [Validators.required]]
    })
  }

  public async uploaded(content: Uint8Array) {
    try {
      const ipHash = utils.keccak256(content);
      this.snackBar.open(`Your hash: ${ipHash}`, 'close');
      const { hash: txHash } = await this.contract.functions.addIp(ipHash);
      this.snackBar.open(`Your TX hash: ${txHash}`, 'close');
      this.form.setValue({ ipHash, txHash });
    } catch(err) {
      throw new Error('Could not upload the hash on Ethereum')
    }

  }

  public submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    this.service.add(this.form.value);
  }
}
