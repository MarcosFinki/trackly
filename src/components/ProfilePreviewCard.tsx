import { useState } from "react";
import "./ProfilePreviewCard.css";

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

  return (
    <div className="profile-preview">
      <div className="profile-preview-avatar">
        {profile.avatar_url ? (
          <img
            key={profile.avatar_url}
            src={profile.avatar_url}
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
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}