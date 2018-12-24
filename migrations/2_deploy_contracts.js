var CoconToken = artifacts.require("./CoconToken.sol");

module.exports = function(deployer, accounts){
	deployer.deploy(CoconToken);
};
