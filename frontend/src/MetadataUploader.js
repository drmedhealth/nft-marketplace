import { useState } from "react";
import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

function MetadataUploader({ imageUrl, onMetadataUploaded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [metadataUrl, setMetadataUrl] = useState("");

  const handleUpload = async () => {
    if (!imageUrl || !name || !description) {
      alert("Please fill all fields and upload an image first.");
      return;
    }

    const metadata = {
      name,
      description,
      image: imageUrl,
    };

    setUploading(true);
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      const hash = res.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      setMetadataUrl(url);
      onMetadataUploaded(url);
    } catch (err) {
      console.error("Metadata upload failed", err);
      alert("❌ Failed to upload metadata");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>🧾 NFT Metadata</h3>
      <input
        type="text"
        placeholder="NFT Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        rows={3}
      />
      <button onClick={handleUpload}>📤 Upload Metadata to IPFS</button>
      {uploading && <p>Uploading metadata...</p>}
      {metadataUrl && (
        <p>✅ Metadata URL: <a href={metadataUrl} target="_blank" rel="noopener noreferrer">{metadataUrl}</a></p>
      )}
    </div>
  );
}

export default MetadataUploader;
