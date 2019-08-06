import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpHashContract, IP_TYPES, IpService, IpState, IpQuery, Ip, createIp } from '@blockframes/ip';
import { User, AuthQuery } from '@blockframes/auth';
import { PersistNgFormPlugin } from '@datorama/akita';
import { utils } from 'ethers';
import { first} from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'ip-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin<IpState>;
  public user: User;
  public form: FormGroup;
  public TYPES = IP_TYPES;
  public GENRES = ['horror'];
  public ip: Ip;

  constructor(
    private service: IpService,
    private query: IpQuery,
    private auth: AuthQuery,
    private snackBar: MatSnackBar,
    private contract: IpHashContract,
    private builder: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.auth.user;
    this.form = this.builder.group({
      'id': [''],
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
      'isan': [''],
    });
    this.persistForm = new PersistNgFormPlugin(this.query, 'form');
    this.persistForm.setForm(this.form);

    this.ip = this.query.getActive() as Ip;

    if (this.ip !== undefined ) {
      this.form.setValue(createIp(this.ip));
    } else {
      this.form.reset();
    }
  }

  ngOnDestroy() {
    this.persistForm.destroy();
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

  /////////////
  // ACTIONS //
  /////////////

  /** Add a new IP to the list of ips */
  public async submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      throw new Error('Invalid form');
    }
    await this.service.update(this.ip.id, this.form.value);
    this.snackBar.open(`Updated ${this.form.get('title').value}`, 'close', {duration: 1000});
    this.router.navigate(['/layout/o/ip', this.ip.id]);
  }

  /** Clear current form with cancellation */
  public clear() {
    const oldState = this.form.value;
    this.form.reset();
    this.persistForm.reset();
    this.snackBar.open('Cleared', 'Cancel', { duration: 1000 })
      .onAction()
      .pipe(first())
      .subscribe(_ => this.form.setValue(oldState));
  }
}
