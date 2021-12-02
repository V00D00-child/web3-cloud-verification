/* eslint-disable no-undef */
var VerificationBase = artifacts.require("./VerificationBase.sol");

module.exports = async function(deployer, network) {
  await deployer.deploy(VerificationBase);
  console.log(`Deploying VerificationBase contract to ${network}`);
};