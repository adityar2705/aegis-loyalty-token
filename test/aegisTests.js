const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Aegis Token contract",function(){
    //global variables
    let AegisToken;
    let aegisToken;
    let owner;
    let addr1;
    let addr2;
    let tokenCap = 1000000;
    let tokenReward = 50;

    //run before each test
    beforeEach(async function(){
        AegisToken = await ethers.getContractFactory("Aegis");
        [owner, addr1, addr2] = await ethers.getSigners();

        aegisToken = await AegisToken.deploy(tokenCap, tokenReward);
    });

    //deployment tests
    describe("Deployment",function(){
        it("should set the owner",async function(){
            expect(await aegisToken.owner()).to.equal(owner.address);
        });

        it("should assign total supply to owner",async function(){
            const ownerBalance = await aegisToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(await aegisToken.totalSupply());
        });

        it("should set the max cap set during deployment",async function(){
            //cap() is a function of the ERC20 token
            const cap = await aegisToken.cap();
            expect(Number(ethers.formatEther(cap))).to.equal(tokenCap);
        });

        it("should set the correct token reward",async function(){
            //cap() is a function of the ERC20 token
            const reward = await aegisToken.reward();
            expect(reward).to.equal(tokenReward);
        });
    });

    //tests for the Aegis token transactions
    describe("Transactions",function(){
        it("Should transfer tokens between accounts", async function () {
            // Transfer 50 tokens from owner to addr1
            await aegisToken.transfer(addr1.address, 50);
            const addr1Balance = await aegisToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);
      
            // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await aegisToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await aegisToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
          });

          it("Should fail if sender doesn't have enough tokens", async function () {
            //transaction should fail since addr1 doesn't have enough Aegis tokens
            //Imp : we can only transfer existing tokens
            const initialOwnerBalance = await aegisToken.balanceOf(owner.address);
            await expect(aegisToken.connect(addr1).transfer(owner.address,1)).to.be.reverted;
      
            // Owner balance shouldn't have changed.
            expect(await aegisToken.balanceOf(owner.address)).to.equal(
              initialOwnerBalance
            );
          });

          //checking balance update
          it("should update balance after transfer",async function(){
            const initBalance = await aegisToken.balanceOf(owner.address);

            //transfer 50 tokens to addr1
            await aegisToken.transfer(addr1.address,50);

            //transfer 100 tokens to addr2
            await aegisToken.transfer(addr1.address,100);
            expect(await aegisToken.balanceOf(addr1.address)).to.equal(150);

          });

          //testing whether mint reward works -> here addr1 and addr2 are like the signers that we've worked with
          it("should be able to mint reward to the app user",async function(){
            await aegisToken.addOrganization(addr1.address);

            //use the mint reward function to reward addr2 with Aegis tokens
            await aegisToken.connect(addr1).mintReward(addr2.address); 
            expect(await aegisToken.balanceOf(addr2.address)).to.equal(50);
          });
    });

    //tests for redeeming the Aegis tokens and burning them after sending them to owner
    describe("Redeeming and burning the Aegis tokens",function(){
      it("should transfer the tokens to owner after burning",async function(){
        //add addr1 as allowed organization and transfer
        await aegisToken.addOrganization(addr1.address);
        await aegisToken.connect(addr1).mintReward(addr2.address);
        console.group("Address 2 (App user after getting token reward)",Number(await aegisToken.balanceOf(addr2.address)));

        //app user exchanges tokens with organization for benefits
        await aegisToken.connect(addr2).transfer(addr1.address,50);
        console.group("Address 1 (Organization after user redeems)",Number(await aegisToken.balanceOf(addr1.address)));

        //organization sends Aegis tokens to owner and owner burns them
        await aegisToken.connect(addr1).redeemTokens();
        console.group("Address 1 (Organization after sending back tokens to owner)",Number(await aegisToken.balanceOf(addr1.address)));
        expect(await aegisToken.balanceOf(addr1.address)).to.equal(0);
      });
    });


});
