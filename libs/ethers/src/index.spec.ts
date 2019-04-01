import { ERC1077 } from "./lib/erc1077";
import { ethers, Wallet, getDefaultProvider } from "ethers";
import { MetaTransaction } from "./lib/meta-transaction";

// Make sure we have at least one test in this module
test('smoke', () => {
  expect(true).toBeTruthy();
});

describe('Blockchain', () => {
  let wallet: Wallet;
  let erc1077: ERC1077;
  let relayer: (tx: MetaTransaction) => (Promise<Object>);

  beforeAll(() => {
    wallet = Wallet.fromMnemonic('library upon horse concert horse crunch copy dice flash design drastic cushion');
    wallet = wallet.connect(getDefaultProvider('ropsten'));
  });
  
  describe('ERC1077', () => {
    beforeAll(async () => {
      relayer = async (tx: MetaTransaction) => ({message: 'hello'});
      erc1077 = new ERC1077('harrypotter', wallet, relayer);
    });

    test('should exist', () => {
      expect(erc1077).toBeDefined();
    });

    test('address should be 0x01f1FB103ebc213D9f0dBBfaF9AC3a43D0f496E3', async () => {
      const address = await erc1077.addressPromise;
      expect(address).toBe('0x01f1FB103ebc213D9f0dBBfaF9AC3a43D0f496E3');
    });

    test('wallet should be the management key of erc1077', async () => {
      const result = await erc1077.functions.keyExist(wallet.address);
      expect(result).toBeTruthy();
    });

    test('send() should be ok', async () => {
      const tx: Partial<MetaTransaction> = {
        to: '0x89dadaa545e089a40e90d1d4921adc719f998a8b',
        value: ethers.utils.bigNumberify(0),
        data: '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
      };
      const res = await erc1077.send(tx);
      expect(res).toMatchObject({message: 'hello'});
    });
    test('send() should throw (at the ethers level)', async () => {
      const tx: Partial<MetaTransaction> = {
        to: '0x89dadaa545e089a40e90d1d4921adc719f998a8', // missing last char of the address
        value: ethers.utils.bigNumberify(0),
        data: '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
      };
      
      erc1077.send(tx).catch((error) => expect(error).toMatch('Error:'));
    });
    test('send() should throw (invalid signature)', async () => {
      const tx: Partial<MetaTransaction> = {
        to: '0x89dadaa545e089a40e90d1d4921adc719f998a8b',
        value: ethers.utils.bigNumberify(0),
        data: '0x368b87720000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a66726f6d2072656d697800000000000000000000000000000000000000000000'
      };
      let otherWallet = Wallet.createRandom();
      otherWallet = otherWallet.connect(getDefaultProvider('ropsten'));
      const otherErc1077 = new ERC1077('harrypotter', otherWallet, relayer);
      otherErc1077.send(tx).catch((error) => expect(error).toMatch('The execution of the meta-transaction will fail !'));
    });
  });
});
