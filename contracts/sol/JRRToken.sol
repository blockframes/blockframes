pragma solidity ^0.5.0;

import "../../node_modules/openzeppelin-solidity/contracts/access/roles/MinterRole.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract ERC20Mintable is ERC20, ERC20Detailed, MinterRole {
  constructor (string memory name, string memory symbol, uint8 decimals) public ERC20Detailed(name, symbol, decimals){}
  function mint(address account, uint256 amount) public onlyMinter returns (bool) {
    _mint(account, amount);
    return true;
  }
}