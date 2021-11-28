const VerificationBase  = artifacts.require('./VerificationBase');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

require('chai')
  .use(require('chai-as-promised'))
  .should();

const EVM_REVERT = 'VM Exception while processing transaction: revert';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('VerificationBase', ([deployer, user1]) => {
  let VerificationBaseInstance;
  let contractAddress;

  beforeEach(async () => {
    VerificationBaseInstance = await VerificationBase.new();
    contractAddress = VerificationBaseInstance.address;
  });

  describe('VerificationBase smart contract', () => {

    it('Should set the owner of the contact as the account that deployed the contract', async () => {
      const ownerCallResult = await VerificationBaseInstance.owner(); 
      ownerCallResult.should.equal(ownerCallResult, deployer);
    });

    it('Should not allow non contract owner to call destory()', async () => {
      await VerificationBaseInstance.destory({from: user1}).should.be.rejectedWith(EVM_REVERT);
    });

    it('Should destory contract', async () => {
      await VerificationBaseInstance.destory({from: deployer});
      let codeAfterDestory = await web3.eth.getCode(contractAddress);
      codeAfterDestory.should.equal(codeAfterDestory, '0x');
    });

    it('Should not allow non contract owner to call withdrawEther()', async () => {
      await web3.eth.sendTransaction({
          from: user1,
          to: contractAddress,
          value: '1000000000000000'
      });
        
      const contractBalance = await VerificationBaseInstance.getBalance();
      contractBalance.toString().should.equal('1000000000000000');

      await VerificationBaseInstance.withdrawEther('1000000000000000', {from: user1}).should.be.rejectedWith(EVM_REVERT);
    });

    it('Should allow contract owner to with withdraw ETH from contract', async () => {
      let contractBalance;

      await web3.eth.sendTransaction({
          from: user1,
          to: contractAddress,
          value: '1000000000000000'
      });
        
      contractBalance = await VerificationBaseInstance.getBalance();
      contractBalance.toString().should.equal('1000000000000000');

      const result = await VerificationBaseInstance.withdrawEther('1000000000000000', {from: deployer});

      contractBalance = await VerificationBaseInstance.getBalance();
      contractBalance.toString().should.equal('0');

      // emits a Withdraw event
      const log = result.logs[0];
      log.event.should.equal('Withdraw');

      const event = log.args;
      event.token.should.equal(ETH_ADDRESS, 'token address is correct');
      event.user.should.equal(deployer, 'user address is correct');
      event.amount.toString().should.equal('1000000000000000', 'amount is correct');
      event.balance.toString().should.equal('0', 'balance is correct');
    });

    it('Should rejects ETH withdraws for insufficient balances', async () => {
      contractBalance = await VerificationBaseInstance.getBalance();
      contractBalance.toString().should.equal('0');
      await VerificationBaseInstance.withdrawEther('1000000000000000', {from: deployer}).should.be.rejectedWith(EVM_REVERT);;
    });

    it('Should return a hashMessage', async () => {
      const messageHash = await VerificationBaseInstance.getMessageHash(
        user1,
        'test message',
        3
      );
      messageHash.should.equal('0x0b820831cbce59212d1a5ff9f4806a17698eb30262deae5a8f687dd11e4dfc56');
    });

    it('Should verify signature', async () => {
      const messageHash = await VerificationBaseInstance.getMessageHash(
        user1,
        'test message',
        3
      );
      let mocksig = await web3.eth.sign(messageHash, user1);

      const verifySig = await VerificationBaseInstance.verify(
        user1,
        messageHash,
        mocksig
      );
      
      messageHash.should.equal('0x0b820831cbce59212d1a5ff9f4806a17698eb30262deae5a8f687dd11e4dfc56');
      verifySig.should.equal(true);
    });
  });
});