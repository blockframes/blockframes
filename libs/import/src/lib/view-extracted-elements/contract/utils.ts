import { Firestore } from '@angular/fire/firestore';
import { where, collection, doc } from 'firebase/firestore';
import { checkParentTerm, ContractsImportState, sheetHeaderLine, } from '@blockframes/import/utils';
import { centralOrgId } from '@env';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { UserService } from '@blockframes/user/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Contract, Movie, Term } from '@blockframes/model';
import {
  createMandate,
  createSale,
  Mandate,
  MovieLanguageSpecification,
  Sale,
  User,
  Language,
} from '@blockframes/model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getContractConfig } from './fieldConfigs';
import { FullMandate, FullSale, territoryAvailabilities } from '@blockframes/contract/avails/avails';
import { TermService } from '@blockframes/contract/term/+state/term.service';


function toTerm(rawTerm: FieldsConfig['term'][number], contractId: string, firestore: Firestore): Term {

  const { medias, duration, territories_excluded = [], territories_included = [], exclusive, licensedOriginal } = rawTerm;


  const languages: Term['languages'] = {};

  const updateLanguage = (key: keyof MovieLanguageSpecification, rawLanguages: Language[] = []) => {
    for (const language of rawLanguages) {
      if (!languages[language])
        languages[language] = { caption: false, dubbed: false, subtitle: false };
      languages[language][key] = true;
    }
  };

  updateLanguage('caption', rawTerm.caption);
  updateLanguage('dubbed', rawTerm.dubbed);
  updateLanguage('subtitle', rawTerm.subtitle);

  const territories = territories_included.filter(territory => !territories_excluded.includes(territory));

  const id = doc(collection(firestore, '_')).id;

  return {
    id,
    languages,
    contractId,
    medias,
    duration,
    territories,
    exclusive,
    licensedOriginal,
    criteria: [],
  };
}

const getTitleContracts = (type: 'mandate' | 'sale', titleId: string) => [
  where('type', '==', type),
  where('titleId', '==', titleId),
  where('status', '==', 'accepted')
];

async function getExistingContracts(type: 'sale', titleId: string, contractService: ContractService, termService: TermService): Promise<FullSale[]>;
async function getExistingContracts(type: 'mandate', titleId: string, contractService: ContractService, termService: TermService): Promise<FullMandate[]>;
async function getExistingContracts(type: 'sale' | 'mandate', titleId: string, contractService: ContractService, termService: TermService): Promise<(FullSale | FullMandate)[]> {
  const query = getTitleContracts(type, titleId);
  const contracts = await contractService.getValue(query);
  const promises = contracts.map(contract => termService.getValue(contract.termIds))
  const terms = await Promise.all(promises);
  return contracts.map((contract, idx) => ({ ...contract, terms: terms[idx] }) as FullSale | FullMandate)
}



/**Verifies if terms overlap with existing mandate terms in the Db */
async function verifyOverlappingMandatesAndSales(contract: Partial<Contract>, terms: Term[], contractService: ContractService, termService: TermService) {
  const mandates = await getExistingContracts('mandate', contract.titleId, contractService, termService);
  const sales = await getExistingContracts('sale', contract.titleId, contractService, termService);
  const availabilities = terms.map(term => {
    const data = { avails: term, mandates: [], sales, bucketContracts: [], existingMandates: mandates };
    return territoryAvailabilities(data);
  });
  const sale = contract.type === 'sale' && availabilities.some(availability => availability.sold.length);
  const mandate = contract.type === 'mandate' && availabilities.some(availability => availability.available.length);
  return { sale, mandate };
}

export interface FormatConfig {
  isSeller: boolean;
}

export async function formatContract(
  sheetTab: SheetTab,
  orgService: OrganizationService,
  titleService: MovieService,
  contractService: ContractService,
  termService: TermService,
  userService: UserService,
  firestore: Firestore,
  blockframesAdmin: boolean,
  userOrgId: string,
  config: FormatConfig
) {
  // Cache to avoid  querying db every time
  const orgNameCache: Record<string, string> = {};
  const titleCache: Record<string, Movie> = {};
  const userCache: Record<string, User> = {};
  const contractCache: Record<string, Mandate | Sale> = {};
  const contracts: ContractsImportState[] = [];
  const caches = { orgNameCache, titleCache, userCache, contractCache };

  const option = {
    orgService,
    titleService,
    contractService,
    userService,
    firestore,
    blockframesAdmin,
    userOrgId,
    caches,
    config,
    separator: ';'
  };

  const fieldsConfig = getContractConfig(option)

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;

    const contract = data.contract.type === 'mandate'
      ? createMandate(data.contract as Mandate)
      : createSale(data.contract as Sale);

    const { titleId, sellerId } = contract;
    if (titleId && sellerId) {
      const movieBelongsToLicensor = await titleService.getValue(titleId).then(title => title.orgIds.includes(sellerId));
      if (!movieBelongsToLicensor) {
        errors.push({
          type: 'error',
          name: 'Wrong Licensor.',
          reason: `The movie does not belong to the licensor.`,
          message: `Please ensure the movie is a movie owned by the licensor.`
        });
      }
    }

    const terms = (data.term ?? []).map(term => toTerm(term, contract.id, firestore));

    // for **internal** sales we should check the parentTerm
    const isInternalSale = contract.type === 'sale' && contract.sellerId === centralOrgId.catalog;
    if (isInternalSale) {
      if (typeof data.parentTerm === 'number') {
        const mandate = contracts[data.parentTerm - sheetHeaderLine.contracts - 1]; // first line is the column names
        contract.parentTermId = mandate?.terms[0]?.id;
        if (!mandate || !contract.parentTermId)
          errors.push({
            type: 'error',
            name: 'Wrong Mandate Row',
            reason: 'Mandate Row point to a wrong sheet line.',
            message: 'Please check that the line number is correct and that the line is a mandate.',
          });
        if (mandate?.contract)
          contract.stakeholders.concat(mandate.contract.stakeholders);
      } else {
        // here we are sure that the term exist because we already tested it above (~line 210, column o: contract.parentTerm)
        contract.parentTermId = data.parentTerm;
        // moreover the corresponding mandate is already in the contractCache so the look up should be efficient
        const mandate = await checkParentTerm(
          contract.parentTermId,
          contractService,
          contractCache
        );
        contract.stakeholders.concat(mandate.stakeholders);
      }
    }


    const overlap = await verifyOverlappingMandatesAndSales(contract, terms, contractService, termService)
    if (overlap.mandate) {
      errors.push({
        type: 'error',
        name: 'Contract',
        reason: 'A term overlaps with that of an existing contract.',
        message: 'A term overlaps with that of an existing contract.'
      });
    }
    if (overlap.sale) {
      errors.push({
        type: 'error',
        name: 'Contract',
        reason: 'The terms of the imported sale have been already sold.',
        message: 'The terms of the imported sale have been already sold.'
      });
    }
    // remove duplicate from stakeholders
    contract.stakeholders = Array.from(new Set([...contract.stakeholders]));

    contracts.push({ contract, terms, errors, newContract: true });
  }
  return contracts;
}
