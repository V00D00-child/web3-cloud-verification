// SPDX-License-Identifier: MIT
// ----------------------------------------------------------------------------
// This smart contract can easily verify any Ethereum signed message signature.
// You just have to provide the Ethereum address that signed the message,
// the  generated signature and the message that has to be verified.

// Updated     : To support Solidity version ^0.8.3
// Programmer  : Idris Bowman
// Link        : https://idrisbowman.com
// Last test   : locally 12/29/21 (https://github.com/V00D00-child/web3-cloud-verification/blob/main/test/Verificationeip712.test.js)

// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerificationEIP712 is Ownable  {
    uint256 private chainId;
    string private name;
    string private version;

    // Structs
    struct Identity {
        string action;
        address signer; 
        string email;
        string url;
        string version;
        uint256 nonce;
        uint256 expiration;
    }
  
    constructor(uint256 _chainId, string memory _name, string memory _version) Ownable() {
        chainId = _chainId;
        name = _name;
        version = _version;
    }

    function verify(
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory action,
        address sender,
        string memory email,
        string memory url,
        uint256 nonce,
        uint256 expiration
    ) public view returns (bool) {
            require(block.timestamp < expiration, "Signature has expired");

            // get domain hash
            bytes32 DOMAIN_SEPARATOR_HASH = keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes(name)),
                    keccak256(bytes(version)),
                    chainId,
                    address(this)
                )
            );

            // get struct hash
            bytes32 structHash = keccak256(
                    abi.encode(
                        keccak256("Identity(string action,address signer,string email,string url,uint256 nonce,uint256 expiration)"),
                        keccak256(bytes(action)),
                        sender,
                        keccak256(bytes(email)),
                        keccak256(bytes(url)),
                        nonce,
                        expiration
                    )
            );

            // verify signature
            bytes32 hash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR_HASH, structHash));
            address signer = ecrecover(hash, v, r, s);
            require(signer != address(0), "ECDSA: Invalid signature");
            return signer == sender;
    }
}