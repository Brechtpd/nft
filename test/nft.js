const truffleAssert = require('truffle-assertions');
var assert = require('assert');

const NftContract = artifacts.require("./CoverCharts.sol");
const Proxy = artifacts.require("./OwnedUpgradabilityProxy.sol");

contract("NFT", (accounts) => {
  const owner = accounts[0];

  const userA = accounts[1];
  const userB = accounts[2];

  let nft;

  before(async () => {
    const proxy = await Proxy.deployed();
    nft = await NftContract.at(proxy.address);
  });

  it('initialize twice', async () => {
    truffleAssert.fails(
      nft.initialize(),
      truffleAssert.ErrorType.revert,
      'Initializable: contract is already initialized'
    );
  });

  it('mint', async () => {
    const tokenID = "82074012285391930765279489314136667830573876033924668146917021887792317657586";
    await nft.safeMint(userA, tokenID, {from: owner});

    const uri = await nft.tokenURI(tokenID);
    assert(uri === "ipfs://QmaYyJx2RTHY7aGLSNX7xEzSYeh8SHU2eLNcVB1XXgzuv9/metadata.json", "unexpected url");

    truffleAssert.fails(
      nft.safeMint(userA, 123, {from: userA}),
      truffleAssert.ErrorType.revert,
      'caller is not the owner'
    );

    const totalSupply = (await nft.totalSupply()).toNumber();
    assert(totalSupply === 1, "unexpected totalSupply");

    // Set the name
    const tokenName = "My Token Name";

    // Try to change the name when not the owner of the token
    truffleAssert.fails(
      nft.changeTokenName(tokenID, tokenName),
      truffleAssert.ErrorType.revert,
      'not the owner'
    );
    // Let the owner change the name
    await nft.changeTokenName(tokenID, tokenName, {from: userA});

    // Check if the name has been change
    assert.equal(await nft.tokenNames(tokenID), tokenName, "token name unexpected");
  });
});
