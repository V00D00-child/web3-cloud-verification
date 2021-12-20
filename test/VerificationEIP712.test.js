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

    // TODO: Update test
    // it('Should return a hashMessage', async () => {
    //   const messageHash = await VerificationEIP712Instance.getMessageHash(
    //     user1,
    //     'test message',
    //     3
    //   );
    //   messageHash.should.equal('0x0b820831cbce59212d1a5ff9f4806a17698eb30262deae5a8f687dd11e4dfc56');
    // });

    // it('Should return a different hashMessage when nounce value is different', async () => {
    //   const mockEthAddress = '0x6c18230ef8bf455adda98f5e3abfe710bd8489c2';
    //   const networkId = 5777; // Ethereum Local
    //   const messageToSign = `Please sign this message to log into profile\naccount:${mockEthAddress}\nnetworkId:${networkId}`;

    //   const messageHash1 = await VerificationEIP712Instance.getMessageHash(
    //     mockEthAddress,
    //     messageToSign,
    //     3
    //   );
    //   messageHash1.should.equal('0xda21aba917ea768e6be4c30e101e3b68ddf6ef815addc2e82cb4e096fb8c6767');

    //   const messageHash2 = await VerificationEIP712Instance.getMessageHash(
    //     mockEthAddress,
    //     messageToSign,
    //     5
    //   );
    //   messageHash2.should.equal('0x7dfe2c394e7891d33e12c9b7eb90625c1a5c387f57c2cd39aea706d8e7249d88');

    //   const isHashequal = messageHash1 === messageHash2;
    //   isHashequal.should.equal(false);
    // });

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

    // it('Should reject imposter account that hijack signatures and message hash', async () => {
    //   const realClaimAccount = '0x6c18230ef8bf455adda98f5e3abfe710bd8489c2';
    //   const networkId = 5777; // Ethereum Local
    //   const messageToSign = `Please sign this message to log into profile\naccount:${realClaimAccount}\nnetworkId:${networkId}`;
    //   const mockNounce = 3;

    //   const messageHash = await VerificationEIP712Instance.getMessageHash(
    //     realClaimAccount,
    //     messageToSign,
    //     mockNounce
    //   );

    //   let mocksig = '0xce21dba1f76d191602cc96d6cca9b65072eb436e05c0c321c44d54bbabfe33311ca8cfecfb2304cc8c3a27b7dd4f9016839124c9d2192a83744bf33f7019cd1e1c';

    //   const imposterClaimAccount = '0x60728965b84289024d4F4a3927B2FB5600d6661A';

    //   const verifySig = await VerificationEIP712Instance.verify(
    //     imposterClaimAccount,
    //     messageHash,
    //     mocksig
    //   ); 
    //   verifySig.should.equal(false);
    // });
  });
});