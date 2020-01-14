pragma solidity ^0.5.9;

import "./Initable.sol";
import "./KeyHolder.sol";

import "../import/ERC1077/IERC1077.sol";

import "../../../node_modules/openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract ERC1077 is KeyHolder, IERC1077, Initable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    address payable private recoverAddress;
    uint256 private lastNonce;

    /// @dev This contract will always be deployed through a Create2 Factory,
    /// KeyHolder needs a key for it's constructor so we add the zero address assuming no body will ever control this account
    /// real "constructor" initialization is done in the `init()` function because the parameter cannot be included in the bytecode for a create2 deploy
    constructor() KeyHolder(address(0x0)) public {} // solium-disable-line no-empty-blocks

    /// @dev This function play the role of the "constructor",
    /// it can be called only once, it should NOT contains any parameters,
    /// but every storage initialization should be hardcoded here,
    /// after compilation we can dynamically modify those arguments just before the create2 deploy.
    /// NOTE : here we use 0xdead solely because it's easier to find this particular string among the compiled byteCode.
    function init(address pubKey, address payable recover) public requireNotInit() {
        Initable.init();

        // "constructor" classical initialization
        this.addKey(pubKey, 1);
        recoverAddress = recover;
    }

    /// @dev Check wether or not a MetaTx can be executed.
    /// The function will compute the MetaTx hash, and then check the signature
    /// against the hash and the known pub keys.
    /// PARAM : a MetaTx
    /// @return a boolean
    function canExecute(
        address to, uint256 value, bytes memory data, uint256 nonce,    // tx
        uint256 gasPrice, address gasToken, uint256 gasLimit,           // gas
        OperationType operationType,                                    // staticcall/call/delegatecal
        bytes memory signatures                                         // signatures
    ) public view returns (bool) {
        bytes32 hash = calculateMessageHash(
            address(this), to, value, data, nonce,  // tx
            gasPrice, gasToken, gasLimit,           // gas
            operationType                           // staticcall/call/delegatecal
        ).toEthSignedMessageHash();
        return areSignaturesValid(signatures, hash);
    }

    /// @dev Calculate a MetaTx's hash
    /// PARAM : a MetaTx WITHOUT the signatures
    /// @return a bytes32 hash
    function calculateMessageHash(
        address from, address to, uint256 value, bytes memory data, uint256 nonce,  // tx
        uint256 gasPrice, address gasToken, uint256 gasLimit,                       // gas
        OperationType operationType                                                 // staticcall/call/delegatecal
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                from, to, value, keccak256(data), nonce,    // tx
                gasPrice, gasToken, gasLimit,               // gas
                uint256(operationType)                      // staticcall/call/delegatecal
            )
        );
    }

    /// @dev Compute the address of the signer of a MetaTx
    /// PARAM : a MetaTx
    /// @return an eth address, if the MetaTx was multi-signed, this function return the 0x0 address
    function getSigner(
        address from, address to, uint256 value, bytes memory data, uint256 nonce,  // tx
        uint256 gasPrice, address gasToken, uint256 gasLimit,                       // gas
        OperationType operationType,                                                // staticcall/call/delegatecal
        bytes memory signatures                                                     // signatures
    ) public pure returns (address) {
        return calculateMessageHash(
            from, to, value, data, nonce,   // tx
            gasPrice, gasToken, gasLimit,   // gas
            operationType                   // staticcall/call/delegatecal
        ).toEthSignedMessageHash().recover(signatures);
    }

    /// @dev Ask the contract to execute a MetaTx
    /// PARAM : a MetaTx
    /// @return a bytes32 hash
    function executeSigned(
        address to, uint256 value, bytes memory data, uint256 nonce,    // tx
        uint256 gasPrice, address gasToken, uint256 gasLimit,           // gas
        OperationType operationType,                                    // staticcall/call/delegatecal
        bytes memory signatures                                         // signatures
    ) public requireInit() returns (bytes32) {

        // checks
        require(signatures.length != 0, "Invalid signatures");
        require(signatures.length % 65 == 0, "Invalid signatures");
        require(nonce == lastNonce, "Invalid nonce");
        require(canExecute(to, value, data, nonce, gasPrice, gasToken, gasLimit, operationType, signatures), "Invalid signature");

        // execute
        bytes memory _data;
        bool success;
        // TODO should check operationType and use staticcall or delegatecall if needed
        (success, _data) = to.call.value(value)(data); // solium-disable-line security/no-call-value
        lastNonce++;

        // event
        bytes32 messageHash = calculateMessageHash(address(this), to, value, data, nonce, gasPrice, gasToken, gasLimit, operationType);
        emit ExecutedSigned(messageHash, lastNonce, success);

        return messageHash;
    }

    /// @dev Refund the relayer with ETH or ERC20 token
    /// PARAM : the gas elements of a MetaTx
    function refund(uint256 gasUsed, uint256 gasPrice, address gasToken) private requireInit() {
        if (gasToken != address(0)) {
            ERC20 token = ERC20(gasToken);
            token.transfer(msg.sender, gasUsed.mul(gasPrice));
        } else {
            msg.sender.transfer(gasUsed.mul(gasPrice));
        }
    }

    /// @dev Ask the contract to execute a MetaTx
    /// PARAM : hash and all signatures (concatenate) of this hash
    /// @return a boolean
    function areSignaturesValid(bytes memory signatures, bytes32 dataHash) private view returns(bool) {
        // There cannot be an owner with address 0.
        uint256 sigCount = signatures.length / 65;
        address lastSigner = address(0);
        address signer;
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 i;
        for (i = 0; i < sigCount; i++) {
            /* solium-disable-next-line security/no-inline-assembly*/
            assembly {
                let signaturePos := mul(0x41, i)
                r := mload(add(signatures, add(signaturePos, 0x20)))
                s := mload(add(signatures, add(signaturePos, 0x40)))
                v := and(mload(add(signatures, add(signaturePos, 0x41))), 0xff)
            }
            signer = ecrecover(dataHash, v, r, s);
            if (!keyExist(signer) || signer <= lastSigner) {
                return false;
            }

            lastSigner = signer;
        }
        return true;
    }

    /// @dev Selfdestruct, and send back all ETH to the recoverAddress.
    /// Only the recoverAddress can call this function, so becareful when setting it in the "init()" function.
    function destroy() public requireInit() {
        require(msg.sender == recoverAddress, 'You cannot perform this action');
        selfdestruct(recoverAddress);
    }

    /// @dev recoverAddress getter
    /// @return an eth address
    function getRecoverAddress() public view returns(address) {
        return recoverAddress;
    }

    /// @dev lastNonce getter
    /// @return a uint256
    function getLastNonce() public view returns(uint256) {
        return lastNonce;
    }
}
