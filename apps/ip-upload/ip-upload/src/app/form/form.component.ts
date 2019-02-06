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
      'version': ['0.0.0', [Validators.required]],
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

  ////////////
  // AUTHOR //
  ////////////
  public get authors() {
    return this.form.get('authors') as FormArray;
  }

  public createAuthor({firstName, lastName}) {
    return this.builder.group({
      'firstName': [firstName, [Validators.required]],
      'lastName': [lastName, [Validators.required]]
    });
  }

  ////////////
  // HASHES //
  ////////////
  /** Hash the file */
  public hashFile(content: Uint8Array) {
    const ipHash = utils.keccak256(content);
    this.form.setValue({ ipHash });
  }

  /** Save the hash on Ethereum */
  public async saveHash(hash: string) {
    const { hash: txHash } = await this.contract.functions.addIp(hash);
    this.form.setValue({ txHash });
  }

  public submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    this.service.add(this.form.value);
  }
}
