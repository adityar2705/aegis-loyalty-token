const { ethers } = require("hardhat");

//Aegis loyalty token deployed at: 0xF819ed59e9d51d8dFE33d2C4258ade339F4a21eD
async function main(){
    const AegisToken = await ethers.getContractFactory("Aegis");
    const aegisToken = await AegisToken.deploy(2000000,25);

    await aegisToken.waitForDeployment();

    console.log("Aegis loyalty token deployed at : ",aegisToken.target);
}

//run main function with error handling
main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
})