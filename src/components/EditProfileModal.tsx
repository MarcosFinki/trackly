import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfilePreviewCard from "./ProfilePreviewCard";
import { updateProfile } from "../services/authService";
import "./EditProfileModal.css";

const API_URL = import.meta.env.PUBLIC_API_URL;

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

  const [avatarPreview, setAvatarPreview] =
    useState<string | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [profile, setProfile] =
    useState<EditableProfile>({
      display_name: "",
      email: "",
      avatar_url: "",
      password: "",
      current_password: "",
    });

  const [initialProfile, setInitialProfile] =
    useState<EditableProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    if (initialProfile) return;

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

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (loading || !user || !initialProfile) {
    return null;
  }

  const passwordFlowInvalid =
    profile.password.length > 0 &&
    profile.current_password.length === 0;

  const hasChanges =
    (profile.display_name !== initialProfile.display_name ||
      profile.email !== initialProfile.email ||
      profile.avatar_url !== initialProfile.avatar_url ||
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

    if (
      profile.display_name !== initialProfile.display_name
    ) {
      payload.display_name =
        profile.display_name.trim();
    }

    if (profile.email !== initialProfile.email) {
      payload.email = profile.email.trim();
    }

    if (profile.password.length > 0) {
      payload.password = profile.password;
      payload.current_password =
        profile.current_password;
    }

    return payload;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      let avatarPath = profile.avatar_url;

      // 📤 Upload avatar si hay archivo nuevo
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);

        const res = await fetch(
          `${API_URL}/auth/me/avatar`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error("UPLOAD_FAILED");
        }

        const data = await res.json();
        avatarPath = data.avatar_url;
      }

      const payload = buildPayload();

      await updateProfile(payload);

      // 🔐 Si cambió contraseña → logout forzado
      if (profile.password.length > 0) {
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        window.location.href = "/login";
        return;
      }

      onClose();

      window.dispatchEvent(
        new Event("trackly:user-updated")
      );
    } catch (err: any) {
      if (
        err?.message ===
        "Current password incorrect"
      ) {
        setError(
          "La contraseña actual es incorrecta"
        );
      } else {
        setError(
          "No se pudo guardar el perfil"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card large">
        <ProfilePreviewCard
          profile={{
            ...profile,
            avatar_url:
              avatarPreview || profile.avatar_url,
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

                const localUrl =
                  URL.createObjectURL(file);

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
                setProfile({
                  ...profile,
                  display_name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Email
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  email: e.target.value,
                })
              }
            />
          </label>

          <label>
            Nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              value={profile.password}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  password: e.target.value,
                })
              }
            />
          </label>

          {profile.password && (
            <label>
              Contraseña actual
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Contraseña actual"
                value={profile.current_password}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    current_password:
                      e.target.value,
                  })
                }
              />
            </label>
          )}

          {passwordFlowInvalid && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "0.7rem",
                marginTop: "4px",
              }}
            >
              Debes ingresar tu contraseña actual
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
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