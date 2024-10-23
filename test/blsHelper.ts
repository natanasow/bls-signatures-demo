import hre from "hardhat";
import * as mcl from 'mcl-wasm';

const {ethers} = hre;

export type KeyPairG1 = {
    secretKey: mcl.Fr,
    publicKeyG1: mcl.G1
}

export type KeyPairG2 = {
    secretKey: mcl.Fr,
    publicKeyG2: mcl.G2
}

export class BlsHelper {
    private readonly G1: mcl.G1 = new mcl.G1();
    private readonly G2: mcl.G2 = new mcl.G2();

    constructor() {
        const g1x: mcl.Fp = new mcl.Fp();
        const g1y: mcl.Fp = new mcl.Fp();
        const g1z: mcl.Fp = new mcl.Fp();

        g1x.setStr('01', 16);
        g1y.setStr('02', 16);
        g1z.setInt(1);

        this.G1.setX(g1x);
        this.G1.setY(g1y);
        this.G1.setZ(g1z);

        this.G2.setX(this.createFp2(
            '0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed',
            '0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2'
        ));
        this.G2.setY(this.createFp2(
            '0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa',
            '0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b'
        ));
        this.G2.setZ(this.createFp2('0x01', '0x00'));
    }

    public createFp2(a: string, b: string): mcl.Fp2 {
        const fp2a = new mcl.Fp();
        fp2a.setStr(a);
        const fp2b = new mcl.Fp();
        fp2b.setStr(b);

        const fp2 = new mcl.Fp2();
        fp2.set_a(fp2a);
        fp2.set_b(fp2b);

        return fp2;
    }

    public createKeyPairG1PubKey(): KeyPairG1 {
        const generatedPrivateKey: string = ethers.Wallet.createRandom().privateKey;

        const secretKeyFr: mcl.Fr = new mcl.Fr();
        secretKeyFr.setHashOf(generatedPrivateKey);

        const pubKeyG1: mcl.G1 = mcl.mul(this.G1, secretKeyFr);
        pubKeyG1.normalize();

        return {
            secretKey: secretKeyFr,
            publicKeyG1: pubKeyG1
        };
    }

    public createKeyPairG2PubKey(): KeyPairG2 {
        const generatedPrivateKey: string = ethers.Wallet.createRandom().privateKey;

        const secretKeyFr: mcl.Fr = new mcl.Fr();
        secretKeyFr.setHashOf(generatedPrivateKey);

        const pubKeyG2: mcl.G2 = mcl.mul(this.G2, secretKeyFr);
        pubKeyG2.normalize();

        return {
            secretKey: secretKeyFr,
            publicKeyG2: pubKeyG2
        };
    }

    public g1FromHex(hex: string): mcl.G1 {
        const frRep: mcl.Fr = new mcl.Fr();
        frRep.setHashOf(hex);

        const g1Point: mcl.G1 = mcl.mul(this.G1, frRep);
        g1Point.normalize();

        return g1Point;
    }

    public g2FromHex(hex: string): mcl.G2 {
        const frRep: mcl.Fr = new mcl.Fr();
        frRep.setHashOf(hex);

        const g2Point: mcl.G2 = mcl.mul(this.G2, frRep);
        g2Point.normalize();

        return g2Point;
    }

    public signG1(messageG1: mcl.G1, secretFr: mcl.Fr): mcl.G1 {
        const signatureG1: mcl.G1 = mcl.mul(messageG1, secretFr);
        signatureG1.normalize();

        return signatureG1;
    }

    public signG2(messageG2: mcl.G2, secretFr: mcl.Fr): mcl.G2 {
        const signatureG2: mcl.G2 = mcl.mul(messageG2, secretFr);
        signatureG2.normalize();

        return signatureG2;
    }

    public serializeFp(p: mcl.Fp | mcl.Fp2): string {
        return ('0x' +
            Array.from(p.serialize())
                .reverse()
                .map((value) => value.toString(16).padStart(2, '0'))
                .join(''));
    }

    public serializeG1Point(pG1: mcl.G1): Array<BigInt> {
        pG1.normalize();

        return [BigInt(this.serializeFp(pG1.getX())), BigInt(this.serializeFp(pG1.getY()))];
    }

    public serializeG2Point(pG2: mcl.G2): Array<BigInt> {
        const x: string = this.serializeFp(pG2.getX());
        const y: string = this.serializeFp(pG2.getY());

        return [
            BigInt(ethers.dataSlice(x, 32)),
            BigInt(ethers.dataSlice(x, 0, 32)),
            BigInt(ethers.dataSlice(y, 32)),
            BigInt(ethers.dataSlice(y, 0, 32))
        ];
    }

    public pAdd(p1: mcl.G1 | mcl.G2, p2: mcl.G1 | mcl.G2): mcl.G1 | mcl.G2 {
        return mcl.normalize(mcl.add(p1, p2));
    }
}
