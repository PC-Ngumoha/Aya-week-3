/**
 * deploy.js
 * 
 * Handles the process of deploying a smart contract
 */
const hre = require('hardhat');
// console.log(hre);

async function main() {
  const currentTimeInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimeInSeconds + ONE_YEAR_IN_SECONDS;

  const lockedAmount = hre.ethers.parseEther('1');

  // console.log(currentTimeInSeconds);
  // console.log(ONE_YEAR_IN_SECONDS);
  // console.log(unlockTime);
  // console.log(lockedAmount);
  // console.log(hre.ethers.parseEther);

  // Interacting with the contract
  const MyTest = await hre.ethers.getContractFactory('MyTest');
  const myTest = await MyTest.deploy(unlockTime, {value: lockedAmount});

  // await myTest.deployed();

  console.log(`Contract address: ${await myTest.getAddress()}`);
  console.log(myTest);
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});