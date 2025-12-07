// src/components/FooterModal.jsx
import React from "react";

export default function FooterModal({ open, title, body, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000
      }}
    >
      <div
        style={{
          width: 460,
          maxWidth: "90%",
          background: "white",
          padding: "26px 24px 22px",
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}
      >
        {title && (
          <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 600 }}>
            {title}
          </h3>
        )}

        {body && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 20px",
              whiteSpace: "pre-line"
            }}
          >
            {body}
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            padding: "8px 24px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
