import { ethers } from 'ethers';

import { ERC1077 } from './erc1077';
import { MetaTransaction } from './meta-transaction';
import { MockRelayer } from '../relayer/relayer';
import { Provider } from '../provider/provider';
import { RelayerWallet } from '../relayer-wallet/relayer-wallet';

describe('ERC1077', () => {
  // test('smoke', () => {expect(true).toBeTruthy()});
  //*
  let name: string;
  let relayer: MockRelayer;
  let provider: Provider;
  let mnemonic: string;
  let wallet: RelayerWallet;
  let erc1077: ERC1077;

  beforeAll(async () => {
    name = 'harrypotter';
    mnemonic = 'library upon horse concert horse crunch copy dice flash design drastic cushion';
    relayer = new MockRelayer();
    provider = new Provider();
    wallet = new RelayerWallet(provider, relayer);
    wallet.loginFromMnemonic(name, mnemonic);
    erc1077 = new ERC1077(name, wallet);
  });

  test('should exist', () => {
    expect(erc1077).toBeDefined();
  });

  test('address should be 0x01f1FB103ebc213D9f0dBBfaF9AC3a43D0f496E3', async () => {
    const address = await erc1077.addressPromise;
    expect(address).toBe('0x01f1FB103ebc213D9f0dBBfaF9AC3a43D0f496E3');
  });

  test('wallet should be the management key of erc1077', async () => {
    const keyExist = await erc1077.functions.keyExist(await wallet.getAddress());
    const hasPurpose = await erc1077.functions.keyHasPurpose(await wallet.getAddress(), 1);
    expect(keyExist).toBeTruthy();
    expect(hasPurpose).toBeTruthy();
  });

  test('send() should be ok', async () => {
    const tx: Partial<MetaTransaction> = {
      to: '0x89dadaa545e089a40e90d1d4921adc719f998a8b',
      value: ethers.utils.bigNumberify(0),
      data:
        '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
    };
    const res = await erc1077.send(tx);
    expect(res).toMatchObject({ data: '0x0' });
  });

  test('send() should throw (at the ethers level)', async () => {
    const tx: Partial<MetaTransaction> = {
      to: '0x89dadaa545e089a40e90d1d4921adc719f998a8', // missing last char of the address
      value: ethers.utils.bigNumberify(0),
      data:
        '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
    };
    erc1077.send(tx).catch(error => expect(error.message).toMatch('Error:'));
  });

  test('send() should throw (invalid signature)', async () => {
    const tx: Partial<MetaTransaction> = {
      to: '0x89dadaa545e089a40e90d1d4921adc719f998a8b',
      value: ethers.utils.bigNumberify(0),
      data:
        '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
    };
    const otherWallet = new RelayerWallet(provider, relayer);
    otherWallet.loginFromMnemonic(
      name,
      'forget farm deal attitude shine cup glove coil lazy pass shoot pond'
    );
    const otherErc1077 = new ERC1077(name, otherWallet);
    otherErc1077
      .send(tx)
      .catch(error => expect(error).toMatch('The execution of the meta-transaction will fail !'));
  });
  //*/
});
