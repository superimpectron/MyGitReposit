import Head from "next/Head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home() {

    const [walletConnected, setWalletConnected] = useState(false);

    const [joinedWhitelist, setJoinedWhitelist] = useState(false);

    const [loading, setLoading] = useState(false);

    const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

    const web3modalRef = useRef();

    const getProviderOrSigner = async (needSigner = false) => {


        const  provider = await web3modalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
                        
        }
        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
            
        }
        return web3Provider;
    };

    const addAddressToWhitelist = async () => {
        try {

            const signer = await getProviderOrSigner(true);

            const whitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                abi,
                signer
            );

            const tx = await whitelistContract.addAddressToWhitelist();
            setLoading(true);

            await tx.wait();
            setLoading(false);

            await getNumberOfWhitelisted();
            setJoinedWhitelist(true);
            
        } catch (error) {
            console.error(error);
            
        }
    };
    const getNumberOfWhitelisted = async () => {
        try {


            const provider = await getProviderOrSigner();

            const whitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                abi,
                provider
            );
            const _numberOfWhitelisted = await whitelistContract.numberOfWhitelisted();
            setNumberOfWhitelisted(_numberOfWhitelisted);
            
        } catch (error) {
            console.error(error);
            
        }
    };
    const checkIfAddressInWhitelist = async () => {
        try {
            const signer = await getProviderOrSigner(true);
        const whitelistContract = new Contract(
            WHITELIST_CONTRACT_ADDRESS,
            abi,
            signer
        );
    
    const address = await signer.getAddress();
    const _joinedWhitelist = await whitelistContract.whitelistAddresses(
        address
    );
    setJoinedWhitelist(_joinedWhitelist);
            
        } catch (error) {
            console.error(error);
            
        }
    };
    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);

            checkIfAddressInWhitelist();
            getNumberOfWhitelisted();
            
        } catch (error) {
            console.error(error);
            
        }
    };
    const renderButton = () => {
        if (walletConnected) {
            if (joinedWhitelist) {
                return(
                    <div className={styles.description}>
                        Thanks for joining the Whitelist!
                    </div>
                );
                
            } else if (loading) {
                return <button className={styles.button}>Loading...</button>;
                
            } else {
                return (
                    <button onClick={addAddressToWhitelist} className={styles.button}>Join the Whitelist</button>
                );
                               
            }
            
        } else {
            return(
                <button onClick={connectWallet} className={styles.button}>Connect Your Wallet</button>
            );
            
        }
    };

    useEffect(() => {
        if (!walletConneted) {
            web3modalRef.current = new web3modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();            
        }
    }, [walletConnected]);

    return (
        <div>
            <Head>
                <title> Whitelist Dapp</title>
                <meta name="Description" content="Whitelist-Dapp" />
                <link rel="icon" href="/favicon.ico" />                
            </Head>
            <div className={styles.main}>
                <div>
                    <h1 className={styles.title}>Welcome to My Crypto D!</h1>
                    <div className={styles.description}>Its an NFT collection for developers</div>
                    <div className={styles.description}>
                        {numberOfWhitelisted} Have already Joined the Whitelist
                    </div>
                    {renderButton()}
                </div>
                <div>
                    <img className={styles.image} src=" ./crypto-devs.org" />
                </div>
            </div>
            <footer className={styles.footer}>
                Made with &#10084; By Crypto Devs
            </footer>
        </div>
    );
    
}