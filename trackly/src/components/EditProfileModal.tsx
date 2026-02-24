import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfilePreviewCard from "./ProfilePreviewCard";
import {
  updateProfile,
  uploadAvatar,
  logout,
} from "../services/authService";
import "./EditProfileModal.css";

type EditableProfile = {
  displayName: string;
  email: string;
  avatarUrl: string;
  password: string;
  currentPassword: string;
};

export default function EditProfileModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [profile, setProfile] = useState<EditableProfile>({
    displayName: "",
    email: "",
    avatarUrl: "",
    password: "",
    currentPassword: "",
  });

  const [initialProfile, setInitialProfile] =
    useState<EditableProfile | null>(null);

  /* ===========================
     LOAD INITIAL DATA
  =========================== */

  useEffect(() => {
    if (!user || initialProfile) return;

    const data: EditableProfile = {
      displayName: user.displayName ?? "",
      email: user.email,
      avatarUrl: user.avatarUrl ?? "",
      password: "",
      currentPassword: "",
    };

    setProfile(data);
    setInitialProfile(data);
  }, [user, initialProfile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (loading || !user || !initialProfile) return null;

  /* ===========================
     VALIDATION
  =========================== */

  const passwordFlowInvalid =
    profile.password.length > 0 &&
    profile.currentPassword.length === 0;

  const hasChanges =
    (profile.displayName !== initialProfile.displayName ||
      profile.email !== initialProfile.email ||
      selectedFile !== null ||
      profile.password.length > 0) &&
    !passwordFlowInvalid;

  const buildPayload = () => {
    const payload: {
      displayName?: string;
      email?: string;
      password?: string;
      currentPassword?: string;
    } = {};

    if (profile.displayName !== initialProfile.displayName) {
      payload.displayName = profile.displayName.trim();
    }

    if (profile.email !== initialProfile.email) {
      payload.email = profile.email.trim();
    }

    if (profile.password.length > 0) {
      payload.password = profile.password;
      payload.currentPassword = profile.currentPassword;
    }

    return payload;
  };

  /* ===========================
     SAVE
  =========================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (selectedFile) {
        await uploadAvatar(selectedFile);
      }

      const payload = buildPayload();

      if (Object.keys(payload).length > 0) {
        await updateProfile(payload);
      }

      if (profile.password.length > 0) {
        await logout();
        window.location.href = "/login";
        return;
      }

      onClose();
      window.dispatchEvent(new Event("trackly:user-updated"));
    } catch {
      setError("No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div className="modal-overlay">
      <div className="modal-card large">
        <ProfilePreviewCard
          profile={{
            ...profile,
            avatarUrl: avatarPreview || profile.avatarUrl,
          }}
        />

        <div className="profile-form">
          <label>
            Foto de perfil
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                  setError("Archivo inválido");
                  return;
                }

                if (file.size > 2 * 1024 * 1024) {
                  setError("La imagen supera 2MB");
                  return;
                }

                const localUrl = URL.createObjectURL(file);
                setAvatarPreview(localUrl);
                setSelectedFile(file);
              }}
            />
          </label>

          <label>
            Usuario
            <input
              value={profile.displayName}
              onChange={(e) =>
                setProfile({ ...profile, displayName: e.target.value })
              }
            />
          </label>

          <label>
            Email
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </label>

          <label>
            Nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={profile.password}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
            />
          </label>

          {profile.password && (
            <label>
              Contraseña actual
              <input
                type="password"
                autoComplete="current-password"
                value={profile.currentPassword}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    currentPassword: e.target.value,
                  })
                }
              />
            </label>
          )}
        </div>

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: "0.75rem" }}>
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={() => {
              setProfile(initialProfile);
              onClose();
            }}
            disabled={saving}
          >
            Descartar
          </button>

          <button
            className="primary"
            disabled={!hasChanges || saving}
            onClick={handleSave}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}