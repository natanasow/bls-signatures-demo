## BLS signatures implementation

BLS signatures are chosen for their favorable properties, including signature aggregation, which can contribute to reducing
the data that needs to be stored and verified on the blockchain, thereby potentially enhancing the scalability and efficiency of the network.

*Note: The examples are using BN_SNARK1 curve, and G1 for public key or G1 for signature and message.*

## Action steps

```
npm install # install deps
npx hardhat test # run some tests
```

## Gas comparison

Gas analysis was conducted in order to understand the percentage deviation between N pairs using G1 for public key and G1 for signature and message.

| Pairs | Actors | G1 public key | G1 signature and message | Gas        | Percentage deviation |
|-------|--------|---------------|--------------------------|------------|----------------------|
| 1     | 1      | ✅            | ❌                        | 141 772    | +0.88                |
| 1     | 1      | ❌            | ✅                        | 140 519    | -0.88                |
| 1     | 5      | ✅            | ❌                        | 141 772    | +0.87                |
| 1     | 5      | ❌            | ✅                        | 140 531    | -0.87                |
| 1     | 15     | ✅            | ❌                        | 141 760    | +0.89                |
| 1     | 15     | ❌            | ✅                        | 140 495    | -0.89                |
| 1     | 25     | ✅            | ❌                        | 141 760    | +0.87                |
| 1     | 25     | ❌            | ✅                        | 140 531    | -0.87                |
| 1     | 50     | ✅            | ❌                        | 141 772    | +0.87                |
| 1     | 50     | ❌            | ✅                        | 140 531    | -0.87                |
| 1     | 100    | ✅            | ❌                        | 141 760    | +0.87                |
| 1     | 100    | ❌            | ✅                        | 140 531    | -0.87                |
| 1     | 150    | ✅            | ❌                        | 141 772    | +0.88                |
| 1     | 150    | ❌            | ✅                        | 140 519    | -0.88                |
| 1     | 200    | ✅            | ❌                        | 141 772    | +0.90                |
| 1     | 200    | ❌            | ✅                        | 140 495    | -0.90                |
| 2     | 2      | ✅            | ❌                        | 185 570    | +0.66                |
| 2     | 2      | ❌            | ✅                        | 184 331    | -0.66                |
| 10    | 10     | ✅            | ❌                        | 505 671    | +0.22                |
| 10    | 10     | ❌            | ✅                        | 504 516    | -0.22                |
| 20    | 20     | ✅            | ❌                        | 905 980    | +0.14                |
| 20    | 20     | ❌            | ✅                        | 904 704    | -0.14                |
| 40    | 40     | ✅            | ❌                        | 1 706 708  | +0.07                |
| 40    | 40     | ❌            | ✅                        | 1 705 394  | -0.07                |
| 60    | 60     | ✅            | ❌                        | 2 507 971  | +0.04                |
| 60    | 60     | ❌            | ✅                        | 2 506 762  | -0.04                |
| 80    | 80     | ✅            | ❌                        | 3 309 335  | +0.03                |
| 80    | 80     | ❌            | ✅                        | 3 308 040  | -0.03                |
