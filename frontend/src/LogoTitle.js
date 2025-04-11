// frontend/src/LogoTitle.js

function LogoTitle() {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/logo.png" alt="LifeIsNFTs Logo" style={{ width: "60px" }} />
        <h1 style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", fontSize: "2rem" }}>
          LifeIsNFTs
        </h1>
      </div>
    );
  }
  
  export default LogoTitle;
  
  