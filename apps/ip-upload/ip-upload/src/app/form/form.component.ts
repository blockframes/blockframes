import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpHashContract, IP_TYPES, IpService } from '@blockframes/ip';
import { User, AuthQuery } from '@blockframes/auth';
import { utils } from 'ethers';

@Component({
  selector: 'ip-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {
  public user: User;
  public form: FormGroup;
  public TYPES = IP_TYPES;
  public GENRES = ['horror'];

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
      'authors': this.builder.array([]),
      'fileUrl': [''],
      'ipHash': [''],
      'txHash': [''],
      'date': [''],
      'signer': [''],
      'isan': ['']
    });
  }

  ///////////
  // GENRE //
  ///////////
  public get genres() {
    return this.form.get('genres') as FormArray;
  }

  public createGenre(genre: string) {
    return this.builder.control(genre);
  }

  get authors() {
    return this.form.get('authors') as FormArray;
  }

  public createAuthor({firstName, lastName}) {
    return this.builder.group({
      'firstName': [firstName, [Validators.required]],
      'lastName': [lastName, [Validators.required]]
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
    console.log(this.form);
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    this.service.add(this.form.value);
  }
}
