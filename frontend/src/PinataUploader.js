import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

function PinataUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    setUploading(true);
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      const hash = res.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
      setIpfsHash(url);
      onUpload(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload to IPFS failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div style={{ border: "2px dashed gray", padding: "20px", marginBottom: "20px" }} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the image here...</p> : <p>📤 Drag & drop an image here to upload to IPFS</p>}
      {uploading && <p>Uploading...</p>}
      {ipfsHash && (
        <div>
          <p>✅ Uploaded: <a href={ipfsHash} target="_blank" rel="noopener noreferrer">{ipfsHash}</a></p>
          <img src={ipfsHash} alt="NFT Preview" style={{ width: 200, marginTop: 10 }} />
        </div>
      )}
    </div>
  );
}

export default PinataUploader;
