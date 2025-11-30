// src/components/CertificateGenerator.jsx
export async function generateAndDownloadCertificate({ course, userName, certId, issuedOn = new Date(), filename }) {
    const dateStr = (issuedOn instanceof Date) ? issuedOn.toLocaleDateString() : issuedOn;
    const title = course.title;
    const issuer = "UPWISE";
    const user = userName || "Learner";
  
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#065F46"/>
          <stop offset="1" stop-color="#10B981"/>
        </linearGradient>
      </defs>
  
      <rect width="100%" height="100%" fill="#fff" rx="20" />
      <rect x="40" y="40" width="1520" height="1050" rx="18" fill="url(#g)" opacity="0.06" />
  
      <g transform="translate(120,140)">
        <text x="0" y="0" font-size="40" font-family="Arial" fill="#065F46" font-weight="800">${issuer} Certificate</text>
  
        <text x="0" y="120" font-size="26" font-family="Arial" fill="#0f172a">This certifies that</text>
  
        <text x="0" y="210" font-size="56" font-family="Arial" fill="#0f172a" font-weight="800">${escapeXml(user)}</text>
  
        <text x="0" y="300" font-size="26" font-family="Arial" fill="#0f172a">has successfully completed the course</text>
  
        <foreignObject x="0" y="330" width="1360" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <p style="font-family:Arial, Helvetica, sans-serif; font-size:36px; font-weight:800; color:#064e3b; margin:0;">
              ${escapeXml(title)}
            </p>
          </div>
        </foreignObject>
  
        <text x="0" y="540" font-size="18" font-family="Arial" fill="#475569">Issued on: ${escapeXml(dateStr)}</text>
        <text x="0" y="578" font-size="18" font-family="Arial" fill="#475569">Certificate ID: ${escapeXml(certId)}</text>
  
        <g transform="translate(1060, 420)">
          <rect x="0" y="0" width="240" height="110" rx="8" fill="#fff" opacity="0.95" />
          <text x="120" y="58" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#065F46">Verified</text>
        </g>
      </g>
    </svg>`;
  
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
  
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = filename || `${certId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(dlUrl);
      return true;
    } catch (err) {
      URL.revokeObjectURL(url);
      throw err;
    }
  }
  
  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = (e) => rej(e);
      img.src = src;
      img.crossOrigin = "anonymous";
    });
  }
  
  function escapeXml(unsafe) {
    return String(unsafe || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  