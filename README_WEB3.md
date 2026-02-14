# Web3 Integration Guide

You have successfully integrated Web3 wallet connection (Metamask) into the application.

## 1. Important: Configure Your Contract
Go to `src/lib/web3.ts` and update the `CONTRACT_ADDRESS` with your deployed contract address.
You should also update `CONTRACT_ABI` with the ABI from your compiled contract.

```typescript
// src/lib/web3.ts
export const CONTRACT_ADDRESS = '0xYourAddressHere';
export const CONTRACT_ABI = [...];
```

## 2. Connecting to Backend on Another PC
Since your backend/contract is deployed on another PC, you need to ensure your browser (and Metamask) can talk to it.

### If deployed on a Public Testnet (Sepolia, Goerli, etc.)
- No extra setup needed!
- Just select the correct network in Metamask.

### If deployed on a Local Blockchain (Hardhat/Ganache) on the other PC
1. **Allow External Access**: Ensure the blockchain node on the other PC is listening on all interfaces (`0.0.0.0`), not just localhost.
   - For Hardhat: `npx hardhat node --hostname 0.0.0.0`
2. **Find IP Address**: Find the local IP address of the other PC (e.g., `192.168.1.50`).
3. **Configure Metamask**:
   - Open Metamask -> Settings -> Networks -> Add Network -> Add a network manually.
   - **RPC URL**: `http://192.168.1.50:8545` (replace with your other PC's IP and port).
   - **Chain ID**: 31337 (for Hardhat) or 1337 (Ganache).
   - **Currency Symbol**: ETH.
4. **Reset Account** (Optional): If you get "Nonce too high" errors, go to Metamask Settings -> Advanced -> Clear activity tab data.

## 3. Usage
- The "Connect Wallet" button on the Login page now uses real Metamask connection.
- `walletService.ts` handles the connection logic.
