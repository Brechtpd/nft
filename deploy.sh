#!/bin/sh

#yarn truffle deploy --reset  --network $NETWORK
yarn truffle deploy --network $NETWORK
truffle run verify OwnedUpgradabilityProxy --network $NETWORK
truffle run verify CoverCharts --network $NETWORK

# https://etherscan.io/proxyContractChecker
