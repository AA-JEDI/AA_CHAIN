
import { ethers } from 'ethers';

// TODO: Replace with your actual deployed contract address
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// TODO: Replace with your actual contract ABI
export const CONTRACT_ABI = [
    // Example methods - replace with your actual ABI
    "function createAgreement(string memory _title, string memory _description, uint256 _price, uint256 _days) public",
    "function deposit(uint256 _agreementId) public payable",
    "function release(uint256 _agreementId) public",
    "function refund(uint256 _agreementId) public",
    "function getAgreement(uint256 _agreementId) public view returns (tuple(string title, address customer, address freelancer, uint256 price, uint8 status))"
];

export const getEthereum = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        return (window as any).ethereum;
    }
    return null;
};

export const getProvider = () => {
    const ethereum = getEthereum();
    if (ethereum) {
        return new ethers.BrowserProvider(ethereum);
    }
    return null;
};

export const getSigner = async () => {
    const provider = getProvider();
    if (provider) {
        return await provider.getSigner();
    }
    return null;
};

export const getContract = async () => {
    const signer = await getSigner();
    if (signer) {
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return null;
};
