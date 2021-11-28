// SPDX-License-Identifier: MIT
// ----------------------------------------------------------------------------
// This smart contract can easily verify any Ethereum signed message signature.
// You just have to provide the Ethereum address that signed the message,
// the  generated signature and the message that has to be verified.

// Updated     : To support Solidity version ^0.8.3
// Programmer  : Idris Bowman
// Link        : https://idrisbowman.com

// ----------------------------------------------------------------------------

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address _to, uint256 _amount) external returns (bool);
}

contract VerificationBase is Ownable {

    constructor() Ownable() {
    }

    function getMessageHash(address _to, string memory _message, uint _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _message, _nonce));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

     /**
     * @notice This function is used to verify a Ethereum Signed Message
     * to this contract.
     * @param _signer address Ethereum address that claimed to sign the message
     * @param _messageHash bytes32 keccak256 message hashed to be signed
     * @param signature bytes The signature
    */
    function verify(address _signer, bytes32 _messageHash, bytes memory signature) public pure returns (bool) {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(_messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    receive() external payable {}

    function destory() public onlyOwner {
        address _owner = this.owner();
        address payable addr = payable(address(_owner));
        selfdestruct(addr);
    }

    function withdrawToken(address _tokenContract, uint256 _amount) external onlyOwner {
        IERC20 tokenContract = IERC20(_tokenContract);
        
        // transfer the token from address of this contract
        // to address of the user (executing the withdrawToken() function)
        tokenContract.transfer(msg.sender, _amount);
    }
}