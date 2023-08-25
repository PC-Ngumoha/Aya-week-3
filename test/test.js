/**
 * test.js
 */

const {time, loadFixture} = require('@nomicfoundation/hardhat-network-helpers');
const {anyValue} = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const {expect} = require('chai');
const {ethers} = require('hardhat');


describe('MyTest', function() {
  async function runEveryTime() {
    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECONDS;

    // GET ACCOUNTS
    const [owner, otherAccount] = await ethers.getSigners();
    
    // console.log(owner);
    // console.log(otherAccount);

    // GET CONTRACT
    const MyTest = await ethers.getContractFactory('MyTest');
    const myTest = await MyTest.deploy(unlockTime, {value: lockedAmount});

    return {myTest, unlockTime, lockedAmount, owner, otherAccount};

    // console.log(ONE_YEAR_IN_SECONDS, ONE_GWEI);
    // console.log(unlockTime);
  }

  // Tests for deployment
  describe('Deployment', function() {
    // Test Case #1: Tests for unlock time of deployment
    it('Should check unlock time', async function() {
      const {myTest, unlockTime} = await loadFixture(runEveryTime);
    
      expect(await myTest.unlockTime()).to.equal(unlockTime);
    });

    // Test Case #2: Tests for the owner of the deployed contract
    it('Should check right contract owner', async function () {
      const {myTest, owner} = await loadFixture(runEveryTime);

      // myTest.owner == address(owner)
      expect(await myTest.owner()).to.equal(owner.address);
    });

    // Test Case #3: Tests for other accounts aside owner of deployed contract
    it('Should check for accounts aside owner', async function () {
      const {myTest, otherAccount} = await loadFixture(runEveryTime);

      // myTest.owner != address(otherAccount)
      expect(await myTest.owner()).not.to.equal(otherAccount.address);
    });

    // Test Case #4: Tests for the contract balance
    it('Should receive and store the funds to MyTest', async function () {
      const {myTest, lockedAmount} = await loadFixture(runEveryTime);

      // myTest.balance == lockedAmount
      expect(await ethers.provider.getBalance(await myTest.getAddress()))
        .to
        .equal(lockedAmount);
    });

    // Test Case #5: Tests the futuricity of the unlock time
    it('Should fail if unlockTime is not in future', async function () {
      const latestTime = await time.latest();

      const MyTest = await ethers.getContractFactory('MyTest');

      await expect(MyTest.deploy(latestTime, {value: 1}))
        .to
        .be
        .revertedWith('Contract must be set to unlock in future');
    });
  });

  describe('Withdrawals', function () {
    // Check the validations for the withdrawal function on the smart contract
    describe('Validations', function () {
      // Test Case #1: Tests that the function call reverts with message.
      it('Should revert with message when called in present time',
      async function () {
        const {myTest} = await loadFixture(runEveryTime);

      await expect(myTest.withdraw()).to.be.revertedWith(
        "This action is not yet available"
      );
      });

      // Test Case #2: Tests that it reverts with message when called by
      // another user.
      it('Should revert with message if not called by owner', async function() {
        const {myTest, unlockTime, otherAccount} = await loadFixture(runEveryTime);

        await time.increaseTo(unlockTime);
        await expect(myTest.connect(otherAccount).withdraw()).to.be.revertedWith(
          "This action can only be carried out by the owner"
        );
      });

      // Test Case #3: Tests that the contract does not fail when the unlockTime
      // arrives and the owner calls it.
      it('Should not fail if called by owner at unlockTime', async function () {
        const {myTest, unlockTime} = await loadFixture(runEveryTime);

        await time.increaseTo(unlockTime);
        await expect(myTest.withdraw()).not.to.be.reverted;
      });
    });
  });

  describe('Events', function () {
    // Test Case #1: Submit events
    it('Should emit events upon successful withdrawal', async function () {
      const {myTest, unlockTime, lockedAmount} = await loadFixture(runEveryTime);

      await time.increaseTo(unlockTime);

      await expect(myTest.withdraw())
        .to
        .emit(myTest, 'Withdrawal')
        .withArgs(lockedAmount, anyValue);
    });
  });

  describe('Transfer', function () {
    // Test Case #1: Transfer funds
    it('Should transfer funds from owner account wallet', async function () {
      const {myTest, unlockTime, lockedAmount, owner} = await loadFixture(
        runEveryTime
      );

      await time.increaseTo(unlockTime);
      // Essentially checks for changes in the ether balance of the owner and
      // contract wallets.
      await expect(myTest.withdraw()).to.changeEtherBalances(
        [owner, myTest],
        [lockedAmount, -lockedAmount]
      );
    });
  });

  // runEveryTime();
})

// console.log(expect);
// console.log(anyValue);

// console.log(time);
// console.log(loadFixture);

// console.log(time.duration.days());