const VerificationEIP712  = artifacts.require('./VerificationEIP712');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545', { blockTime: 15 }));

require('chai')
  .use(require('chai-as-promised'))
  .should();

const EVM_REVERT = 'VM Exception while processing transaction: revert';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('VerificationEIP712', ([deployer, user1]) => {
  let verificationEIP712Instance;
  let contractAddress;

  beforeEach(async () => {
    verificationEIP712Instance = await VerificationEIP712.new(5777,'Web3 Cloud','1');
    contractAddress = verificationEIP712Instance.address;
  });

  describe('VerificationEIP712 smart contract', () => {

    it('Should set the owner of the contact as the account that deployed the contract', async () => {
      const ownerCallResult = await verificationEIP712Instance.owner(); 
      ownerCallResult.should.equal(ownerCallResult, deployer);
    });

    it('Should not allow non contract owner to call destory()', async () => {
      await verificationEIP712Instance.destory({from: user1}).should.be.rejectedWith(EVM_REVERT);
    });

    it('Should destory contract', async () => {
      await verificationEIP712Instance.destory({from: deployer});
      let codeAfterDestory = await web3.eth.getCode(contractAddress);
      codeAfterDestory.should.equal(codeAfterDestory, '0x');
    });

    it('Should not allow non contract owner to call withdrawEther()', async () => {
      await web3.eth.sendTransaction({
          from: user1,
          to: contractAddress,
          value: '1000000000000000'
      });
        
      const contractBalance = await verificationEIP712Instance.getBalance();
      contractBalance.toString().should.equal('1000000000000000');

      await verificationEIP712Instance.withdrawEther('1000000000000000', {from: user1}).should.be.rejectedWith(EVM_REVERT);
    });

    it('Should allow contract owner to with withdraw ETH from contract', async () => {
      let contractBalance;

      await web3.eth.sendTransaction({
          from: user1,
          to: contractAddress,
          value: '1000000000000000'
      });
        
      contractBalance = await verificationEIP712Instance.getBalance();
      contractBalance.toString().should.equal('1000000000000000');

      const result = await verificationEIP712Instance.withdrawEther('1000000000000000', {from: deployer});

      contractBalance = await verificationEIP712Instance.getBalance();
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
      contractBalance = await verificationEIP712Instance.getBalance();
      contractBalance.toString().should.equal('0');
      await verificationEIP712Instance.withdrawEther('1000000000000000', {from: deployer}).should.be.rejectedWith(EVM_REVERT);;
    });

    it('Should verify signature', async () => {
      const mockSigCreds = {
        sender: '',
        v: 0,
        r: '',
        s: '',
        action: '',
        email: '',
        url:'',
        nonce: '',
        expiration: 2
      }

      const verifySig = await VerificationEIP712Instance.verify(
        mockSigCreds.v,
        mockSigCreds.r,
        mockSigCreds.s,
        mockSigCreds.action,
        mockSigCreds.sender,
        mockSigCreds.email,
        mockSigCreds.url,
        mockSigCreds.nonce,
        mockSigCreds.expiration
      );
      
      verifySig.should.equal(true);
    });
  });
});
