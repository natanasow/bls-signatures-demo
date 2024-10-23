import hre from "hardhat";
import * as mcl from 'mcl-wasm';
import {expect} from "chai";
import {BlsHelper, KeyPairG1, KeyPairG2} from './blsHelper';

const {ethers} = hre;

describe('BLS verifier', function () {
    let contract: ethers.BaseContract;
    let blsBn254Helper: BlsHelper;

    let validSingleG1PubKeyCallData: Array<BigInt[]>;
    let validSingleG1SigAndMsgCallData: Array<BigInt[]>;

    const MAX_PERCENTAGE_DIFFERENCE: number = 1;

    before(async function () {
        await mcl.init(mcl.BN_SNARK1);
        mcl.setETHserialization(true);
        mcl.setMapToMode(0);

        blsBn254Helper = new BlsHelper();

        const factory: ethers.ContractFactory = await ethers.getContractFactory('BlsVerifier');
        contract = await factory.deploy();
        await contract.waitForDeployment();
    });

    it('single verification using G1 for public key and G2 for signature and message', async () => {
        const {secretKey, publicKeyG1} = blsBn254Helper.createKeyPairG1PubKey();
        const msgG2: mcl.G2 = blsBn254Helper.g2FromHex(ethers.keccak256('0x160c'));
        const sigG2: mcl.G2 = blsBn254Helper.signG2(msgG2, secretKey);

        const pubKeyG1Ser: BigInt[] = blsBn254Helper.serializeG1Point(publicKeyG1);
        const msgG2Ser: BigInt[] = blsBn254Helper.serializeG2Point(msgG2);
        const sigG2Ser: BigInt[] = blsBn254Helper.serializeG2Point(sigG2);

        validSingleG1PubKeyCallData = [
            pubKeyG1Ser,
            msgG2Ser,
            sigG2Ser
        ];

        const isEcPairingValid: boolean = await contract.verifySingleG1PubKeyG2SigAndMsg(...validSingleG1PubKeyCallData);
        expect(isEcPairingValid).to.be.true;
    });

    it('single verification using G1 for signature and message and G2 for public key', async () => {
        const {secretKey, publicKeyG2} = blsBn254Helper.createKeyPairG2PubKey();
        const msgG1: mcl.G1 = blsBn254Helper.g1FromHex(ethers.keccak256('0x160c'));
        const sigG1: mcl.G1 = blsBn254Helper.signG1(msgG1, secretKey);

        const pubKeyG2Ser: BigInt[] = blsBn254Helper.serializeG2Point(publicKeyG2);
        const msgG1Ser: BigInt[] = blsBn254Helper.serializeG1Point(msgG1);
        const sigG1Ser: BigInt[] = blsBn254Helper.serializeG1Point(sigG1);

        validSingleG1SigAndMsgCallData = [
            pubKeyG2Ser,
            msgG1Ser,
            sigG1Ser
        ];

        const isEcPairingValid: boolean = await contract.verifySingleG1SigAndMsgG2PubKey(...validSingleG1SigAndMsgCallData);
        expect(isEcPairingValid).to.be.true;
    });

    it('gas estimation for single verification should be within a range', async () => {
        const pubKeyG1Gas: BigInt = await contract.verifySingleG1PubKeyG2SigAndMsg.estimateGas(...validSingleG1PubKeyCallData);
        const sigAndMsgG1Gas: BigInt = await contract.verifySingleG1SigAndMsgG2PubKey.estimateGas(...validSingleG1SigAndMsgCallData);

        const percentageDiff: number = 100 * Math.abs((Number(pubKeyG1Gas) - Number(sigAndMsgG1Gas)) / ((Number(pubKeyG1Gas) + Number(sigAndMsgG1Gas)) / 2));
        expect(percentageDiff).to.be.lessThanOrEqual(MAX_PERCENTAGE_DIFFERENCE);
    });

    // for (const actors of [5, 15, 25, 50, 100, 150, 200]) {
    //     let g1PubKeyCallData: Array<BigInt[]>;
    //     let g1SigAndMsgCallData: Array<BigInt[]>;
    //
    //     it(`single verification using G1 for ${actors} aggregated public key and G2 for ${actors} aggregated signature and same message`, async () => {
    //         let pubKeysG1Aggregated: mcl.G1;
    //         let sigG2Aggregated: mcl.G2;
    //
    //         const msgG2: mcl.G2 = blsBn254Helper.g2FromHex(ethers.keccak256('0x160c'));
    //         for (let i = 0; i < actors; i++) {
    //             const signer: KeyPairG1 = blsBn254Helper.createKeyPairG1PubKey();
    //             const pubKeyG1: mcl.G1 = signer.publicKeyG1;
    //             const sigG2: mcl.G2 = blsBn254Helper.signG2(msgG2, signer.secretKey);
    //
    //             // @ts-ignore
    //             pubKeysG1Aggregated = (i === 0) ? pubKeyG1 : blsBn254Helper.pAdd(pubKeysG1Aggregated, pubKeyG1);
    //             // @ts-ignore
    //             sigG2Aggregated = (i === 0) ? sigG2 : blsBn254Helper.pAdd(sigG2Aggregated, sigG2);
    //         }
    //
    //         g1PubKeyCallData = [
    //             blsBn254Helper.serializeG1Point(pubKeysG1Aggregated),
    //             blsBn254Helper.serializeG2Point(msgG2),
    //             blsBn254Helper.serializeG2Point(sigG2Aggregated)
    //         ]
    //         const isEcPairingValid: boolean = await contract.verifySingleG1PubKeyG2SigAndMsg(...g1PubKeyCallData);
    //         expect(isEcPairingValid).to.be.true;
    //     });
    //
    //     it(`single verification using G1 for ${actors} signature and same message and G2 for ${actors} public key`, async () => {
    //         let pubKeysG2Aggregated: mcl.G2;
    //         let sigG1Aggregated: mcl.G1;
    //
    //         const msgG1 = blsBn254Helper.g1FromHex(ethers.keccak256('0x160c'));
    //         for (let i = 0; i < actors; i++) {
    //             const signer: KeyPairG2 = blsBn254Helper.createKeyPairG2PubKey();
    //             const pubKeyG2: mcl.G2 = signer.publicKeyG2;
    //             const sigG1: mcl.G1 = blsBn254Helper.signG1(msgG1, signer.secretKey);
    //
    //             // @ts-ignore
    //             pubKeysG2Aggregated = (i === 0) ? pubKeyG2 : blsBn254Helper.pAdd(pubKeysG2Aggregated, pubKeyG2);
    //             // @ts-ignore
    //             sigG1Aggregated = (i === 0) ? sigG1 : blsBn254Helper.pAdd(sigG1Aggregated, sigG1);
    //         }
    //
    //         g1SigAndMsgCallData = [
    //             blsBn254Helper.serializeG2Point(pubKeysG2Aggregated),
    //             blsBn254Helper.serializeG1Point(msgG1),
    //             blsBn254Helper.serializeG1Point(sigG1Aggregated)
    //         ];
    //
    //         const isEcPairingValid: boolean = await contract.verifySingleG1SigAndMsgG2PubKey(...g1SigAndMsgCallData);
    //         expect(isEcPairingValid).to.be.true;
    //     });
    //
    //     it(`gas estimation for ${actors} aggregated signatures and public keys should be within a range`, async () => {
    //         const pubKeyG1Gas: BigInt = await contract.verifySingleG1PubKeyG2SigAndMsg.estimateGas(...g1PubKeyCallData);
    //         const sigAndMsgG1Gas: BigInt = await contract.verifySingleG1SigAndMsgG2PubKey.estimateGas(...g1SigAndMsgCallData);
    //
    //         const percentageDiff: number = 100 * Math.abs((Number(pubKeyG1Gas) - Number(sigAndMsgG1Gas)) / ((Number(pubKeyG1Gas) + Number(sigAndMsgG1Gas)) / 2));
    //         expect(percentageDiff).to.be.lessThanOrEqual(MAX_PERCENTAGE_DIFFERENCE);
    //     });
    // }

    for (const pairs of [2, 10, 20, 40, 60, 80]) {
        let g1PubKeyCallData: Array<BigInt[] | Array<BigInt[]>>;
        let g1SigAndMsgCallData: Array<BigInt[] | Array<BigInt[]>>;

        it(`${pairs} verifications using G1 for public key G2 for signature and message`, async () => {
            let pubKeysG1Arr: Array<BigInt[]> = [];
            let msgsG2Arr: Array<BigInt[]> = [];
            let sigG2Aggregated: mcl.G2;
            for (let i = 0; i < pairs; i++) {
                const signer: KeyPairG1 = blsBn254Helper.createKeyPairG1PubKey();
                const msgG2: mcl.G2 = blsBn254Helper.g2FromHex(ethers.keccak256('0x' + (5644 + i).toString()));
                const sigG2: mcl.G2 = blsBn254Helper.signG2(msgG2, signer.secretKey);

                pubKeysG1Arr.push(blsBn254Helper.serializeG1Point(signer.publicKeyG1));
                msgsG2Arr.push(blsBn254Helper.serializeG2Point(msgG2));

                // @ts-ignore
                sigG2Aggregated = (i === 0) ? sigG2 : blsBn254Helper.pAdd(sigG2Aggregated, sigG2);
            }

            g1PubKeyCallData = [
                pubKeysG1Arr,
                msgsG2Arr,
                blsBn254Helper.serializeG2Point(sigG2Aggregated)
            ];

            const isEcPairingValid: boolean = await contract.verifyMultipleG1PubKeyG2SigAndMsg(...g1PubKeyCallData);
            expect(isEcPairingValid).to.be.true;
        });

        it(`${pairs} verification using G1 for signature and message and G2 for public key`, async () => {
            let pubKeysG2Arr: Array<BigInt[]> = [];
            let msgsG1Arr: Array<BigInt[]> = [];
            let sigG1Aggregated: mcl.G1;
            for (let i = 0; i < pairs; i++) {
                const signer: KeyPairG2 = blsBn254Helper.createKeyPairG2PubKey();
                const msgG1: mcl.G1 = blsBn254Helper.g1FromHex(ethers.keccak256('0x' + (5644 + i).toString()));
                const sigG1: mcl.G1 = blsBn254Helper.signG1(msgG1, signer.secretKey);

                pubKeysG2Arr.push(blsBn254Helper.serializeG2Point(signer.publicKeyG2));
                msgsG1Arr.push(blsBn254Helper.serializeG1Point(msgG1));

                // @ts-ignore
                sigG1Aggregated = (i === 0) ? sigG1 : blsBn254Helper.pAdd(sigG1Aggregated, sigG1);
            }

            g1SigAndMsgCallData = [
                pubKeysG2Arr,
                msgsG1Arr,
                blsBn254Helper.serializeG1Point(sigG1Aggregated)
            ];

            const isEcPairingValid: boolean = await contract.verifyMultipleG1SigAndMsgG2PubKey(...g1SigAndMsgCallData);
            expect(isEcPairingValid).to.be.true;
        });

        it(`gas estimation for ${pairs} verifications should be within a range`, async () => {
            const pubKeyG1Gas: BigInt = await contract.verifyMultipleG1PubKeyG2SigAndMsg.estimateGas(...g1PubKeyCallData);
            const sigAndMsgG1Gas: BigInt = await contract.verifyMultipleG1SigAndMsgG2PubKey.estimateGas(...g1SigAndMsgCallData);

            const percentageDiff: number = 100 * Math.abs((Number(pubKeyG1Gas) - Number(sigAndMsgG1Gas)) / ((Number(pubKeyG1Gas) + Number(sigAndMsgG1Gas)) / 2));
            expect(percentageDiff).to.be.lessThanOrEqual(MAX_PERCENTAGE_DIFFERENCE);
        });
    }
});
