var CoconSale = artifacts.require("./CoconSale.sol");
var CoconToken = artifacts.require("./CoconToken.sol");

module.exports = function(deployer, accounts){
	deployer.deploy(CoconSale, '0x9c4188de9a3e544d238d7cb3af48705c6a3f2d0f', CoconToken.address, 1000, 1000, 98000);
};
