const NftContract = artifacts.require("./CoverCharts.sol");
const Proxy = artifacts.require("./OwnedUpgradabilityProxy.sol");

module.exports = async (deployer, network, addresses) => {
  console.log("Deploying to " + network);

  const loopringExchangeAddress = "0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4";

  let owner;
  let proxyRegistryAddress = ""; // OpenSea proxy registry addresses for rinkeby and mainnet.
  if (network === 'rinkeby') {
    owner = "0x7f81e0CcbD8cd4218d4fb74a00d85f86cFFd8A15";
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else if (network === 'development') {
    owner = addresses[0];
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  } else {
    owner = "0x77A32bb7784F15007dC0b41794676131B3DF752a";
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  await deployer.deploy(NftContract, proxyRegistryAddress, loopringExchangeAddress, {gas: 5000000});
  const implementation = await NftContract.deployed();

  await deployer.deploy(Proxy, {gas: 5000000});
  const proxy = await Proxy.deployed();
  await proxy.upgradeTo(implementation.address);
  await proxy.transferProxyOwnership(owner);

  const nft = await NftContract.at(proxy.address);
  await nft.initialize();

  await nft.transferOwnership(owner);

  console.log("NFT proxy contract: " + proxy.address);
  console.log("NFT implementation: " + implementation.address);
};
