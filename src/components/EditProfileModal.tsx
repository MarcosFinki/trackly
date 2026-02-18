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
  display_name: string;
  email: string;
  avatar_url: string;
  password: string;
  current_password: string;
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
    display_name: "",
    email: "",
    avatar_url: "",
    password: "",
    current_password: "",
  });

  const [initialProfile, setInitialProfile] =
    useState<EditableProfile | null>(null);

  /* ===========================
     LOAD INITIAL DATA
  =========================== */

  useEffect(() => {
    if (!user || initialProfile) return;

    const data: EditableProfile = {
      display_name: user.display_name ?? "",
      email: user.email,
      avatar_url: user.avatar_url ?? "",
      password: "",
      current_password: "",
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
    profile.current_password.length === 0;

  const hasChanges =
    (profile.display_name !== initialProfile.display_name ||
      profile.email !== initialProfile.email ||
      selectedFile !== null ||
      profile.password.length > 0) &&
    !passwordFlowInvalid;

  const buildPayload = () => {
    const payload: {
      display_name?: string;
      email?: string;
      password?: string;
      current_password?: string;
    } = {};

    if (profile.display_name !== initialProfile.display_name) {
      payload.display_name = profile.display_name.trim();
    }

    if (profile.email !== initialProfile.email) {
      payload.email = profile.email.trim();
    }

    if (profile.password.length > 0) {
      payload.password = profile.password;
      payload.current_password = profile.current_password;
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

      // 📤 Avatar upload vía Tauri
      if (selectedFile) {
        await uploadAvatar(selectedFile);
      }

      const payload = buildPayload();

      if (Object.keys(payload).length > 0) {
        await updateProfile(payload);
      }

      // 🔐 Si cambió contraseña → logout
      if (profile.password.length > 0) {
        await logout();
        window.location.href = "/login";
        return;
      }

      onClose();
      window.dispatchEvent(new Event("trackly:user-updated"));
    } catch (err: any) {
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
            avatar_url: avatarPreview || profile.avatar_url,
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
              value={profile.display_name}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
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
                value={profile.current_password}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    current_password: e.target.value,
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