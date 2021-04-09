import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from 'hardhat/config';

export const config: HardhatUserConfig = {
  solidity: "0.5.0",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env['ALCHEMY_KEY']}`
    }
  },
  defaultNetwork: 'rinkeby'
};

export default config;
