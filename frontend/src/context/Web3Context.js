import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import BloodDonationSystem from '../artifacts/contracts/BloodDonationSystem.sol/BloodDonationSystem.json';

const Web3Context = createContext(null);

export { Web3Context };
export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use a default contract address if not set in environment
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    useEffect(() => {
        initializeEthers();
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }
        
        // Add listener for the custom logout event
        const handleLogout = () => {
            disconnectWallet();
        };
        window.addEventListener('userLogout', handleLogout);
        
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
            window.removeEventListener('userLogout', handleLogout);
        };
    }, []);

    const initializeEthers = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this application');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Log network information
            const network = await provider.getNetwork();
            console.log('Connected to network:', network);
            
            // Check if we're on the correct network
            const expectedChainId = process.env.REACT_APP_NETWORK_ID || '1337';
            if (network.chainId.toString() !== expectedChainId) {
                try {
                    // Try to switch to the correct network
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${parseInt(expectedChainId).toString(16)}` }],
                    });
                } catch (switchError) {
                    // If the network is not added to MetaMask, add it
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${parseInt(expectedChainId).toString(16)}`,
                                chainName: 'Localhost 8545',
                                nativeCurrency: {
                                    name: 'Ethereum',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['http://127.0.0.1:8545']
                            }]
                        });
                    } else {
                        throw new Error('Failed to switch network. Please connect to the correct network manually.');
                    }
                }
            }

            const contract = new ethers.Contract(
                contractAddress,
                BloodDonationSystem.abi,
                signer
            );

            // Verify contract deployment
            const code = await provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Contract not deployed at the specified address. Please make sure the contract is deployed.');
            }

            console.log('Contract address:', contractAddress);
            console.log('Contract code exists:', code !== '0x');

            setProvider(provider);
            setSigner(signer);
            setContract(contract);

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (err) {
            console.error('Web3 initialization error:', err);
            setError(err.message || 'Failed to initialize Web3');
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this application');
            }

            // Request accounts directly
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please connect your wallet.');
            }

            // Initialize provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Update contract with signer
            const contractWithSigner = new ethers.Contract(
                contractAddress,
                BloodDonationSystem.abi,
                signer
            );

            // Update state
            setProvider(provider);
            setSigner(signer);
            setContract(contractWithSigner);
            setAccount(accounts[0]);
            setError(null);

            return accounts[0];
        } catch (err) {
            console.error('Wallet connection error:', err);
            const errorMessage = err.message || 'Failed to connect wallet';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
        } else {
            setAccount(null);
            setError('Please connect your wallet to continue');
        }
    };

    const disconnectWallet = async () => {
        try {
            // Reset the state
            setAccount(null);
            setError(null);
            
            if (window.ethereum) {
                // Re-initialize provider without requesting accounts
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);
                
                // We don't set the signer here to avoid automatic connection
                setSigner(null);
                
                // Reset contract
                const contract = new ethers.Contract(
                    contractAddress,
                    BloodDonationSystem.abi,
                    provider
                );
                setContract(contract);
            }
        } catch (err) {
            console.error("Error during wallet disconnect:", err);
            setError('Failed to disconnect wallet');
        }
    };

    // Contract interaction methods
    const registerDonor = async (bloodGroup) => {
        try {
            const tx = await contract.registerDonor(bloodGroup);
            await tx.wait();
            return tx;
        } catch (err) {
            setError('Failed to register donor');
            throw err;
        }
    };

    const recordBloodDonation = async (donorAddress, bloodGroup) => {
        try {
            const tx = await contract.recordBloodDonation(donorAddress, bloodGroup);
            await tx.wait();
            return tx;
        } catch (err) {
            setError('Failed to record blood donation');
            throw err;
        }
    };

    const requestBlood = async (bloodGroup) => {
        try {
            const tx = await contract.requestBlood(bloodGroup);
            await tx.wait();
            return tx;
        } catch (err) {
            setError('Failed to request blood');
            throw err;
        }
    };

    const updateRequestStatus = async (requestId, status) => {
        try {
            const tx = await contract.updateRequestStatus(requestId, status);
            await tx.wait();
            return tx;
        } catch (err) {
            setError('Failed to update request status');
            throw err;
        }
    };

    const value = {
        provider,
        signer,
        contract,
        account,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        registerDonor,
        recordBloodDonation,
        requestBlood,
        updateRequestStatus
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
}; 