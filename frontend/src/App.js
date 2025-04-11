import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { contractAddress, contractABI } from "./constants";
import PinataUploader from "./PinataUploader";
import MetadataUploader from "./MetadataUploader";
import LogoTitle from "./LogoTitle";

// 🟡 Read-only provider (Alchemy)
const readOnlyProvider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/bEIb2Kv5L64Y2MjEMJFfcVDW2M2hyyyM"
);

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [listings, setListings] = useState([]);
  const [ipfsImageUrl, setIpfsImageUrl] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");

  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("dark") === "true"
  );

  const [stats, setStats] = useState({ totalMinted: 0, totalListings: 0 });

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#fff";
    if (typeof window !== "undefined") {
      localStorage.setItem("dark", darkMode);
    }
  }, [darkMode]);

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
      console.log("✅ Wallet connected");
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  }

  async function mintNFT() {
    if (!metadataUrl) {
      alert("Please upload metadata first.");
      return;
    }
    if (!contract) {
      alert("Connect wallet first.");
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
    if (!contract) {
      alert("Connect wallet first.");
      return;
    }
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
    if (!contract) {
      alert("Connect wallet first.");
      return;
    }
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
      const publicContract = new ethers.Contract(contractAddress, contractABI, readOnlyProvider);
      const totalTokens = await publicContract.tokenCount();
      const active = [];

      for (let i = 1; i <= totalTokens; i++) {
        const item = await publicContract.getListing(i);
        if (item.active) {
          let image = "";
          try {
            const tokenUri = await publicContract.tokenURI(item.tokenId);
            const metadata = await fetch(tokenUri).then((res) => res.json());
            image = metadata.image || "";
          } catch (metaErr) {
            console.warn(`Failed to load metadata for token ${i}:`, metaErr);
          }
          active.push({ ...item, image, id: i });
        }
      }

      setListings(active);
      setStats({
        totalMinted: totalTokens.toString(),
        totalListings: active.length,
      });
    } catch (err) {
      console.error("Error loading listings", err);
    }
  }

  return (
    <div style={{ padding: "2rem", color: darkMode ? "#fff" : "#000" }}>
      <LogoTitle />
      <button onClick={connectWallet}>🔌 Connect Wallet</button>
      <button onClick={mintNFT}>🎨 Mint NFT (Metadata + IPFS)</button>
      <button onClick={listNFT}>📤 List NFT</button>
      <button onClick={loadListings}>🔄 Refresh Listings</button>
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <hr />
      <h3>📊 Stats</h3>
      <p>Total NFTs Minted: {stats.totalMinted}</p>
      <p>Active Listings: {stats.totalListings}</p>

      <hr />
      <PinataUploader onUpload={(url) => setIpfsImageUrl(url)} />
      <MetadataUploader
        imageUrl={ipfsImageUrl}
        onMetadataUploaded={(url) => setMetadataUrl(url)}
      />

      <hr />
      <h2>🛍️ Listings</h2>
      {listings.length === 0 && <p>No active listings.</p>}
      {listings.map((item, index) => {
        const tokenId = item.tokenId?.toString?.() || item.id?.toString?.() || `${index + 1}`;
        const price = item.price ? ethers.formatEther(item.price) : "0";
        return (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9",
            }}
          >
            <img
              src={item.image || "/placeholder.png"}
              alt="NFT Preview"
              style={{ width: "200px", marginBottom: "10px" }}
            />
            <p><strong>Token ID:</strong> {tokenId}</p>
            <p><strong>Seller:</strong> {item.seller}</p>
            <p><strong>Price:</strong> {price} ETH</p>
            <button onClick={() => buyNFT(tokenId, price)}>Buy</button>
            <a
              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20NFT%20on%20LifeIsNFTs!%0AToken%20ID:%20${tokenId}%0APrice:%20${price}%20ETH%0A${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: "10px", color: "#1DA1F2" }}
            >
              🐦 Share on X
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default App;

