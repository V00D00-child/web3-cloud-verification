// SPDX-License-Identifier: MIT
// ----------------------------------------------------------------------------
// This smart contract can easily verify any Ethereum signed message signature.
// You just have to provide the Ethereum address that signed the message,
// the  generated signature and the message that has to be verified.

// Updated     : To support Solidity version ^0.8.3
// Programmer  : Idris Bowman
// Link        : https://idrisbowman.com
// Last test   : locally 11/29/21 (VerificationBase.test.js)

// ----------------------------------------------------------------------------

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VerificationEIP712 is Ownable  {

    // Structs
    struct Identity {
        string action;
        address signer; 
        string email;
        string url;
        string version;
        uint256 nonce;
    }
  
    constructor() Ownable() {
    }

    function verify(
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory action,
        address sender,
        string memory email,
        string memory url,
        string memory version,
        uint256 nonce
    ) public pure returns (bool) {

            // get domain hash
            bytes32 DOMAIN_SEPARATOR_HASH = keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes("My amazing dApp")),
                    keccak256(bytes("1")),
                    4,
                    0x1C56346CD2A2Bf3202F771f50d3D14a367B48070
                )
            );

            // get struct hash
            bytes32 structHash = keccak256(
                    abi.encode(
                        keccak256("Identity(string action,address signer,string email,string url,string version,uint256 nonce)"),
                        keccak256(bytes(action)),
                        sender,
                        keccak256(bytes(email)),
                        keccak256(bytes(url)),
                        keccak256(bytes(version)),
                        nonce
                    )
            );

            // verify signature
            bytes32 hash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR_HASH, structHash));
            address signer = ecrecover(hash, v, r, s);
            require(signer != address(0), "ECDSA: Invalid signature");
            return signer == sender;
    }
}