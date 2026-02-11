import { useState } from "react";
import "./ProfilePreviewCard.css";

const API_URL = "http://localhost:3001";

export default function ProfilePreviewCard({
  profile,
}: {
  profile: {
    display_name: string;
    email: string;
    avatar_url: string;
    password: string;
  };
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  const initials =
    profile.display_name?.[0]?.toUpperCase() ??
    profile.email[0].toUpperCase();

  const avatarSrc = profile.avatar_url
    ? profile.avatar_url.startsWith("blob:")
      ? profile.avatar_url
      : `${API_URL}${profile.avatar_url}.webp`
    : null;

  return (
    <div className="profile-preview">
      <div className="profile-preview-avatar">
        {avatarSrc ? (
          <img
            key={avatarSrc}
            src={avatarSrc}
            alt="Avatar"
          />
        ) : (
          <div className="avatar-fallback">
            {initials}
          </div>
        )}
      </div>

      <div className="info">
        <strong>
          {profile.display_name || "—"}
        </strong>
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
              onClick={() =>
                setShowPassword((v) => !v)
              }
            >
              {showPassword
                ? "Ocultar"
                : "Ver"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}