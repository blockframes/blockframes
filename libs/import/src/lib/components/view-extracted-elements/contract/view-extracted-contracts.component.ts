import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { extract, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import { createMandate, createSale, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Intercom } from 'ng-intercom';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractsImportState, SpreadsheetImportError } from '../../../import-utils';
import { AuthQuery } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { parseToAll } from '@blockframes/utils/static-model';
import { AngularFirestore } from '@angular/fire/firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { centralOrgId } from '@env';
import { Scope } from '@blockframes/utils/static-model/static-model';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state/movie.model';

const separator = ';'
type errorCodes = 'no-title-id' | 'no-seller-id' | 'wrong-contract-id' | 'no-buyer-id' | 'no-stakeholders' | 'no-territories' | 'no-medias' | 'no-duration-from' | 'no-duration-to';

const errorsMap: { [key in errorCodes]: SpreadsheetImportError } = {
  'no-title-id': {
    type: 'warning',
    field: 'contract.titleId',
    reason: `No title found`,
    name: 'no-title-id',
    hint: 'Please check the international title or enter the ID of the title'
  },
  'no-seller-id': {
    type: 'warning',
    field: 'contract.sellerId',
    reason: `Couldn't find Licensor with the provided name.`,
    name: 'Seller ID',
    hint: 'Edit corresponding sheet field.'
  },
  'no-buyer-id': {
    type: 'warning',
    field: 'contract.buyerId',
    reason: `Couldn't find Licensee with the provided name.`,
    name: 'Buyer ID',
    hint: 'Edit corresponding sheet field.'
  },
  'wrong-contract-id': {
    type: 'warning',
    field: 'contract.contractId',
    reason: `Couldn't find contract with provided Id`,
    name: 'Contract Id',
    hint: 'Edit corresponding sheet field.'
  },
  'no-stakeholders': {
    type: 'warning',
    field: 'contract.stakeholders',
    name: 'Stakeholders',
    reason: 'If this mandate has stakeholders, please fill in the name',
    hint: 'Edit corresponding sheet field.'
  },
  'no-territories': {
    type: 'error',
    field: 'term.territories',
    name: 'Territory',
    reason: 'Archipel Content needs to know the territories in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-medias': {
    type: 'error',
    field: 'term.medias',
    name: 'Media',
    reason: 'Archipel Content needs to know the medias in which the movie can be sold.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-from': {
    type: 'warning',
    field: 'term.duration.from',
    name: 'Duration from',
    reason: 'Archipel Content needs to know the starting date of the contract.',
    hint: 'Edit corresponding sheet field.'
  },
  'no-duration-to': {
    type: 'warning',
    field: 'term.duration.to',
    name: 'Duration to',
    reason: 'Archipel Content needs to know the ending date of the contract.',
    hint: 'Edit corresponding sheet field.'
  }
}

function split(cell: string) {
  return cell.split(separator).filter(v => !!v).map(v => v.trim());
}

// Time is MM/DD/YYYY
function convertDate(time: string) {
  if (isNaN(+time)) {
    const [month, day, year] = time.split(/[/.]+/).map(t => parseInt(t, 10));
    return new Date(year, month - 1, day, 0, 0, 0);
  } else {
    return new Date(Math.round(+time - 25569) * 86400 * 1000);
  }
}

function getDate(value: string, error: SpreadsheetImportError) {
  const date = convertDate(value);
  if (isNaN(date.getTime()))
    return new ValueWithWarning(value, error);
  return date;
}

function getStatic(scope: Scope, value: string) {
  if (!value) return []
  if (value.toLowerCase() === 'all') return parseToAll(scope, 'all');
  return split(value).map(v => getKeyIfExists(scope, v)).filter(v => !!v);
}

function getStaticList(scope: Scope, value: string, error?: SpreadsheetImportError) {
  const values = getStatic(scope, value);
  if (error && !values.length) {
    return new ValueWithWarning(values, error);
  }
  return values;
}

const fieldsConfig = {
   /* a */'title.international': (value: string) => value,
   /* b */'contractType': (value: string) => value.toLowerCase() as 'mandate' | 'sale',
   /* c */'licensorName': (value: string) => value,
   /* d */'licenseeName': (value: string) => value,
   /* e */'territories': (value: string) => getStaticList('territories', value, errorsMap['no-territories']),
   /* f */'medias': (value: string) => getStaticList('medias', value, errorsMap['no-medias']),
   /* g */'exclusive': (value: string) => {
    return value.toLowerCase() === 'yes' ? true : false;
  },
   /* h */'duration.from': (value: string) => getDate(value, errorsMap['no-duration-from']),
   /* i */'duration.to': (value: string) => getDate(value, errorsMap['no-duration-to']),
   /* j */'originalLanguageLicensed': (value: string) => value,
   /* k */'dubbed': (value: string) => getStaticList('languages', value),
   /* l */'subtitle': (value: string) => getStaticList('languages', value),
   /* m */'closedCaptioning': (value: string) => getStaticList('languages', value),
   /* n */'contractId': (value: string) => value,
   /* o */'parentTermId': (value: string) => value,
   /* p */'titleId': (value: string) => value,
   /* q */'stakeholdersList': (value: string) => value ? split(value) : value,
} as const;

type FieldsType = keyof typeof fieldsConfig;
type GetValue<T> = T extends ValueWithWarning ? T["value"] : T
type ImportType = { [key in FieldsType]: GetValue<ReturnType<typeof fieldsConfig[key]>> }



@Component({
  selector: 'import-view-extracted-contracts',
  templateUrl: './view-extracted-contracts.component.html',
  styleUrls: ['./view-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedContractsComponent implements OnInit {

  public contractsToUpdate = new MatTableDataSource<ContractsImportState>();
  public contractsToCreate = new MatTableDataSource<ContractsImportState>();
  public isUserBlockframesAdmin = false;

  private memory = {
    org: {},
    title: {},
  };

  constructor(
    @Optional() private intercom: Intercom,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private fire: AngularFirestore
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  private async getOrgId(name: string) {
    if (!name) return '';
    // @TODO #6586 carefull if you are on a anonymized db, centralOrgId.catalog org name will not be 'Archipel Content'
    if (name === 'Archipel Content') return centralOrgId.catalog;
    if (!this.memory.org[name]) {
      const orgs = await this.orgService.getValue(ref => ref.where('denomination.full', '==', name));
      this.memory.org[name] = orgs.length === 1 ? orgs[0].id : '';
    }
    return this.memory.org[name];
  }

  private async getTitleId(name: string) {
    if (!name) return '';
    if (!this.memory.title[name]) {
      const titles = await this.movieService.getValue(ref => ref.where('title.international', '==', name));
      this.memory.title[name] = titles.length === 1 ? titles[0].id : '';
    }
    return this.memory.title[name];
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');

    for (const rawRow of sheetTab.rows) {
      const row = rawRow.map(cell => typeof cell === "string" ? cell.trim() : cell.toString());
      if (!row.length) continue;

      // optional fields are prefixed with underscore
      const {
        data: {
          title, contractType,
          licensorName, licenseeName,
          territories, medias,
          exclusive,
          duration, dubbed, stakeholdersList,
          subtitle, closedCaptioning,
          contractId: extractedContractId,
          titleId: extractedTitleId,
        }, errors, warnings,
      } = extract<ImportType>([row], fieldsConfig)

      //////////////
      // CONTRACT //
      //////////////
      // TITLE
      const titleId = extractedTitleId || (await this.getTitleId(title.international));

      if (!titleId) errors.push(errorsMap['no-title-id']);

      // BUYER / SELLER
      const [sellerId, buyerId] = await Promise.all([
        this.getOrgId(licensorName),
        this.getOrgId(licenseeName)
      ])
      if (!sellerId) errors.push(errorsMap['no-seller-id']);
      if (!buyerId) errors.push(errorsMap['no-buyer-id']);

      // STAKEHOLDER
      const getStakeholders = Array.isArray(stakeholdersList) ? stakeholdersList.map(orgName => this.getOrgId(orgName)) : [];
      const stakeholders = (await Promise.all(getStakeholders)).filter(s => !!s);
      if (!stakeholders.length) errors.push(errorsMap['no-stakeholders']);

      // PARENT TERM ID
      // TODO add parentTermId to the sales & mandates

      // CONTRACT
      let baseContract: Partial<Mandate | Sale> = {};
      if (extractedContractId) {
        baseContract = await this.contractService.getValue(extractedContractId);
        if (!baseContract) errors.push(errorsMap['wrong-contract-id']);
      } else {
        baseContract.id = this.fire.createId();
      }
      const contract = contractType === 'mandate'
        ? createMandate({ ...baseContract as Mandate, titleId, buyerId, sellerId, stakeholders, status: 'accepted' })
        : createSale({ ...baseContract as Sale, titleId, buyerId, sellerId, stakeholders, status: 'accepted' });


      ///////////
      // TERMS //
      ///////////
      const contractId = contract.id;

      const termId = this.fire.createId();
      const term = createTerm({ id: termId, contractId, duration, territories, medias, exclusive });

      // Languages
      for (const [key, languages] of Object.entries({ dubbed, subtitle, closedCaptioning })) {
        for (const language of languages) {
          if (!term.languages[language]) term.languages[language] = createMovieLanguageSpecification();
          term.languages[language][key] = true;
        }
      }

      contract.termIds.push(termId);

      this.contractsToCreate.data.push({
        contract,
        newContract: !extractedContractId,
        errors: warnings,
        terms: [term]
      });
      // Forcing change detection
      this.contractsToCreate.data = [...this.contractsToCreate.data];
      this.cdRef.markForCheck();
    }

    matSnackbarRef.dismissWithAction(); // loading ended */
  }

  public openIntercom() {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.contractsToCreate.data = [];
    this.contractsToUpdate.data = [];
  }

}
