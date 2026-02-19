import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import "./ProfilePreviewCard.css";

export default function ProfilePreviewCard({
  profile,
}: {
  profile: {
    displayName: string;
    email: string;
    avatarUrl: string;
    password: string;
  };
}) {
  const [showPassword, setShowPassword] = useState(false);

  const initials =
    profile.displayName?.[0]?.toUpperCase() ??
    profile.email[0]?.toUpperCase();

  const avatarSrc = profile.avatarUrl
    ? convertFileSrc(profile.avatarUrl)
    : null;

  return (
    <div className="profile-preview">
      <div className="profile-preview-avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" />
        ) : (
          <div className="avatar-fallback">{initials}</div>
        )}
      </div>

      <div className="info">
        <strong>{profile.displayName || "—"}</strong>
        <span>{profile.email}</span>

        <div className="password-line">
          <span>
            {profile.password
              ? showPassword
                ? profile.password
                : "••••••••"
              : "Contraseña no modificada"}
          </span>

          {profile.password && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}