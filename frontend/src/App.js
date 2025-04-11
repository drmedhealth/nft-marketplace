import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { contractAddress, contractABI } from "./constants";
import PinataUploader from "./PinataUploader";
import MetadataUploader from "./MetadataUploader"; // ✅ NEW
import LogoTitle from "./LogoTitle"; // ✅ This imports the logo component


function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [listings, setListings] = useState([]);
  const [ipfsImageUrl, setIpfsImageUrl] = useState(""); // ✅ Image URL from IPFS
  const [metadataUrl, setMetadataUrl] = useState("");   // ✅ Metadata URL

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal();
      const instance = await web3Modal.connect();
      const prov = new ethers.BrowserProvider(instance);
      const signer = await prov.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setProvider(prov);
      setSigner(signer);
      setContract(contract);

      console.log("✅ Connected to wallet");
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  }

  // ✅ Updated to use metadataUri
  async function mintNFT() {
    if (!metadataUrl) {
      alert("Please upload metadata first.");
      return;
    }

    try {
      const tx = await contract.createToken(metadataUrl);
      await tx.wait();
      alert("🎉 NFT Minted!");
    } catch (err) {
      console.error(err);
      alert("❌ Minting failed");
    }
  }

  async function listNFT() {
    const tokenId = prompt("Enter Token ID to list:");
    const price = prompt("Enter price in ETH:");
    if (!tokenId || !price) return;
    try {
      const tx = await contract.listToken(tokenId, ethers.parseEther(price));
      await tx.wait();
      alert("✅ NFT listed for sale");
    } catch (err) {
      console.error(err);
      alert("❌ Listing failed");
    }
  }

  async function buyNFT(tokenId, price) {
    try {
      const tx = await contract.buyToken(tokenId, {
        value: ethers.parseEther(price),
      });
      await tx.wait();
      alert("🛒 NFT Purchased!");
    } catch (err) {
      console.error(err);
      alert("❌ Purchase failed");
    }
  }

  async function loadListings() {
    try {
      const active = [];
      for (let i = 1; i <= 20; i++) {
        const item = await contract.getListing(i);
        if (item.active) {
          active.push(item);
        }
      }
      setListings(active);
    } catch (err) {
      console.error("Error loading listings", err);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <LogoTitle />
      <button onClick={connectWallet}>🔌 Connect Wallet</button>
      <button onClick={mintNFT}>🎨 Mint NFT (Metadata + IPFS)</button>
      <button onClick={listNFT}>📤 List NFT</button>
      <button onClick={loadListings}>🔄 Load Listings</button>

      <hr />
      {/* ✅ Upload Image to IPFS */}
      <PinataUploader onUpload={(url) => setIpfsImageUrl(url)} />

      {/* ✅ Upload Metadata to IPFS */}
      <MetadataUploader
        imageUrl={ipfsImageUrl}
        onMetadataUploaded={(url) => setMetadataUrl(url)}
      />

      <hr />
      <h2>🛍️ Listings</h2>
      {listings.length === 0 && <p>No active listings.</p>}
      {listings.map((item, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <p><strong>Token ID:</strong> {item.tokenId.toString()}</p>
          <p><strong>Seller:</strong> {item.seller}</p>
          <p><strong>Price:</strong> {ethers.formatEther(item.price)} ETH</p>
          <button onClick={() => buyNFT(item.tokenId, ethers.formatEther(item.price))}>Buy</button>
        </div>
      ))}
    </div>
  );
}

export default App;
