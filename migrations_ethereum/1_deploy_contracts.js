/* eslint-disable no-undef */
var VerificationBase = artifacts.require("./VerificationBase.sol");
var VerificationEIP712 = artifacts.require("./VerificationEIP712.sol");

module.exports = async function(deployer, network) {
  // Deploy VerificationBase
  // await deployer.deploy(VerificationBase);
  // console.log(`Deploying VerificationBase contract to ${network}`);

  // Deploy VerificationEIP712
  let chainId;
  const name = 'Web3 Cloud';
  const version = '1';
  if(deployer.network === 'rinkeby') {
    chainId = 4;
  } else if (deployer.network === 'arbitrum_testnet') {
    chainId = 421611;
  } else if (deployer.network === 'arbitrum_mainnet') {
    chainId = 42161;
  } else if (deployer.network === 'main') {
    chainId = 1;
  } else {
    chainId = 5777;
  }

  await deployer.deploy(
    VerificationEIP712,
    chainId,
    name,
    version
  );
  console.log(`Deploying VerificationEIP712 contract to ${deployer.network}`);
};