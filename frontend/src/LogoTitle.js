// frontend/src/LogoTitle.js

function LogoTitle() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <img
        src="/logo.png"
        alt="LifeIsNFTs Logo"
        style={{
          width: "80px",        // 🔼 Increase this from 60px to 80px or higher
          height: "auto"
        }}
      />
      <h1
        style={{
          margin: 0,
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: "2.2rem",  // Optional: bump text size slightly
        }}
      >
        LifeIsNFTs
      </h1>
    </div>
  );
}

export default LogoTitle;
