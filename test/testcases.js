var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var CoconSale = artifacts.require("CoconSale");
var CoconToken = artifacts.require("CoconToken");
var Web3 = require("web3");
chai.use(chaiAsPromised);
var expect = chai.expect;

var sale = null;
var token = null;

var web3;
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

//web3.personal.unlockAccount(addr, pass);
const amountToSend = web3.utils.toWei("1", "ether"); //convert to wei value
//var send = web3.eth.sendTransaction({from:addr,to:toAddress, value:amountToSend});

contract('CoconSale and CoconToken contracts TESTs', function(accounts){	
	web3.eth.defaultAccount = accounts[0];
//	console.log(CoconSale.abi);
	var saleCont = new web3.eth.Contract(CoconSale.abi, CoconSale.address);
	
//	var saleObj = saleCont.at(CoconSale.address);
	
	describe("Test if CoconSale and CoconToken have been deployed", function(){
		it("Catch if CoconSale is deployed", function(){
			return CoconSale.deployed().then(function(instance){
				sale = instance;
			});
		});

		it("Catch if CoconToken is deployed", function(){
                       return CoconToken.deployed().then(function(instance){
				token = instance;
			});
                });
	});	
	
	describe("Test CoconSale variables", function(){
		it("Catch if beneficiary address is set correctly", function(){
			return sale.beneficiary.call().then(function(res){
				expect(res.toString()).to.be.equal(accounts[1]);
			}); 
		});

		it("Catch if dynamicLocktime is set correctly", function(){
                        return sale.dynamicLocktime.call().then(function(res){
                                expect(parseInt(res)).to.be.equal(1000);
                        });
                });

		it("Catch if lockType is set correctly", function(){
                        return sale.lockType.call().then(function(res){
                                expect(parseInt(res)).to.be.equal(0);
                        });
                });

		it("Catch if owner address is set correctly", function(){
                        return sale.owner.call().then(function(res){
                                expect(res.toString()).to.be.equal(accounts[0]);
                        });
                });

		it("Catch if tokenAvailable initially is 0", function(){
                        return sale.tokenAvailable.call().then(function(res){
                                expect(parseInt(res)).to.be.equal(0);
                        });
                });

		it("Catch if charged initially is false", function(){
                        return sale.charged.call().then(function(res){
                                expect(res).to.be.equal(false);
                        });
                });
	});

	describe("Test CoconToken variables", function(){
		it("Catch if name is Cocon Token", function(){
			return token.name.call().then(function(res){
				expect(res.toString()).to.be.equal("Cocon Token");
			});
		});

		it("Catch if symbol is COCO", function(){
                        return token.symbol.call().then(function(res){
                                expect(res.toString()).to.be.equal("COCO");
                        });
                });

		it("Catch if decimals is set to 8 places", function(){
                        return token.decimals.call().then(function(res){
                                expect(parseInt(res)).to.be.equal(8);
                        });
                });

		it("Catch if initial_supply is 10000000000000000000", function(){
                        return token.initial_supply.call().then(function(res){
                                expect(parseInt(res)).to.be.equal(10000000000000000000);
                        });
                });
	});
		
	describe("Test CoconSale and CoconToken functions", function(){
		describe("Modifiers CHECK", function(){
			it("Catch if modifier onlyOwner is working for CoconSale", function(){
				return expect(sale.doChargeCrowdsale(1, {"from":accounts[9]}))
				.to.be.eventually.rejected;
			});

			it("Catch if modifier onlyOwner is working for CoconToken", function(){
                	        return expect(token._doPause(1, {"from":accounts[9]}))
                        	.to.be.eventually.rejected;
	                });
		});		
		
		describe("Function(CoconSale): doChargeCrowdsale before token transfer", function(){
			it("Catch if doChargeCrowsale is Working Before charging", function(){
        	                return sale.doChargeCrowdsale(1).then(function(txn){
                	                expect(txn).to.not.be.an("error");
                        	});
                	});
		});
		
		describe("Function(CoconToken): transfer", function(){
			it("Catch if token transfer is working", function(){
				return token.transfer(CoconSale.address, '10000000000000000').then(function(txn){
					expect(txn).to.not.be.an("error");
				});
			});
		});

		describe("Function(CoconToken): balanceOf", function(){
			it("Catch if token balance of Contract is displayed correctly", function(){
				return token.balanceOf.call(CoconSale.address).then(function(res){
					expect(res.toString()).to.be.equal("10000000000000000");
				});
			});
		});
			
		describe("Function(CoconSale): doChargeCrowdsale after token transfer", function(){
			it("Catch if doChargeCrowsale is Working After charging", function(){
	                	return sale.doChargeCrowdsale(1).then(function(txn){
                                	expect(txn).to.not.be.an("error");
                        	});
			});

			it("Catch if charged is true after charging", function(){
	                        return sale.charged.call().then(function(res){
                        	        expect(res).to.be.equal(true);
                	        });
        	        });
	
			it("Catch if tokenAvailable is 10000000000000000 after charging", function(){
                        	return sale.tokenAvailable.call().then(function(res){
                	                expect(res.toString()).to.be.equal("10000000000000000");
        	                });
	                });
		});
		
		describe("Function(CoconSale): fallback payable function", function(){
			
			it("Catch if can be payed", function(){
				return web3.eth.sendTransaction({from:accounts[6], to:sale.address, value:amountToSend, gas:6000000}).then(function(res){
					expect(res).to.not.be.an("error");
				}); 

			});

			it("Catch balance of CoconSale", async function(){
				return web3.eth.getBalance(sale.address, function(err, res){
					expect(res.toString()).to.be.equal(amountToSend.toString());
				});
			});

			it("Catch if tokenBalanceOf "+accounts[6], function(){
				return sale.tokenBalanceOf.call(accounts[6]).then(function(res){
					expect(parseInt(res)).to.be.at.least(1);
				});
			});
			
			it("Catch if timelocksOf for "+accounts[6], function(){
                                return sale.timelocksOf.call(accounts[6]).then(function(res){
                                        expect(parseInt(res)).to.be.at.least(1);
                                });
                        });

			it("Test if contract received " + amountToSend + " ether", async () => {
			        let balance = await web3.eth.getBalance(sale.address);
			        expect(balance).to.equal(amountToSend);
			});

    			it("Test if balanceOf fromAccount is at least 1 ether in the contract", async () => {
			        let balanceOf    = await sale.balanceOf.call(accounts[6]);
			        let balanceOfInt = parseInt(web3.utils.fromWei(balanceOf, 'ether'));
			        expect(balanceOfInt).to.be.at.least(1);
    			});
		});
		
		describe("Function(CoconSale): claimTokens", function(){
			//it("Catch if claimTokens is working
		});
		
		describe("Function(CoconSale): setLockType", function(){
			it("Catch if lockType can be changed", function(){
				return sale.setLockType(1).then(function(res){
					expect(res).to.be.not.an("error");
				});
			});

			it("Catch if lockType is set correctly", function(){
                        	return sale.lockType.call().then(function(res){
        	                        expect(parseInt(res)).to.be.equal(1);
                        	});
                	});
		});
		
		describe("Function(CoconSale): setExchangeRate", function(){
                        it("Catch if exchange rate can be changed", function(){
                                return sale.setExchangeRate(98359).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });

                        it("Catch if setExchangeRate set correctly", function(){
                                return sale.exchangeRate.call().then(function(res){
  	                              expect(parseInt(res)).to.be.equal(98359);
                                });
                        });
                });
		
		describe("Function(CoconSale): transferOwnership", function(){
                        it("Catch if ownership can be transferred to : " + accounts[5], function(){
                                return sale.transferOwnership(accounts[5]).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });

                        it("Catch if new owner is : " + accounts[5], function(){
				return sale.owner.call().then(function(res){
                                	expect(res.toString()).to.be.equal(accounts[5]);
                        	});
                        });

			it("Catch if ownership can be transferred back to : " + accounts[0], function(){
                                return sale.transferOwnership(accounts[0], {from:accounts[1]}).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });
	
			it("Catch if new owner is : " + accounts[0], function(){
                                return sale.owner.call().then(function(res){
                                        expect(res.toString()).to.be.equal(accounts[0]);
                                });
                        });
                });

				
		describe("Function(CoconSale): transferRaisedFunds", function(){
                        it("Catch if raisedFunds are trunsferred " , function(){
                                return sale.transferRaisedFunds(1).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });

                        it("Catch if funds are transfered", function(){
				return web3.eth.getBalance(sale.address, function(err, res){
                                        expect(res.toString()).to.be.equal('0');
                                });
                        });
                });

		describe("Function(CoconSale): lock test", function(){
                        it("Catch if unlocks lock for address " + accounts[6] , function(){
                                return sale.unlockTokensFor(accounts[6]).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });
                        
                        it("Catch if lock is 1 for address : " + accounts[6], function(){
				return sale.timelocksOf.call(accounts[6]).then(function(res){
                                        expect(parseInt(res)).to.be.equal(1);
                                });
                        });

			it("Catch if resets lock for address " + accounts[6] , function(){
                                return sale.resetLockFor(accounts[6]).then(function(res){
                                        expect(res).to.be.not.an("error");
                                });
                        });

                        it("Catch if lock is 0 for address : " + accounts[6], function(){
                                return sale.timelocksOf.call(accounts[6]).then(function(res){
                                        expect(parseInt(res)).to.be.equal(0);
                                });
                        });
                });

		describe("Function(CoconSale): getLeftOver Tokens", function(){
			it("Catch if token can returned to bene " , function(){
				return sale.getLeftOver(1).then(function(res){
					expect(res).to.be.not.an("error");
				});
			});
			
			it("Catch if token balance of bene", function(){
				return token.balanceOf.call(accounts[1]).then(function(res){
					var tok = parseInt(res/1e8);
					//console.log(tok);
                                        expect(parseInt(tok)).to.be.at.least(1);
                                });
			});
		});
	});
});
