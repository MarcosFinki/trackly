import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProfilePreviewCard from "./ProfilePreviewCard";
import { updateProfile } from "../services/authService";
import "./EditProfileModal.css";

type EditableProfile = {
  display_name: string;
  email: string;
  avatar_url: string;
  password: string;
};

export default function EditProfileModal({
  onClose,
}: {
  onClose: () => void;
}) {
    const { user, loading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(
    null
    );

  // ✅ hooks SIEMPRE arriba
  const [profile, setProfile] =
    useState<EditableProfile>({
      display_name: "",
      email: "",
      avatar_url: "",
      password: "",
    });

  const [initialProfile, setInitialProfile] =
    useState<EditableProfile | null>(null);

  // 🔁 sincronizar cuando llega el user
  useEffect(() => {
    if (!user) return;

    const data: EditableProfile = {
      display_name: user.display_name ?? "",
      email: user.email,
      avatar_url: user.avatar_url ?? "",
      password: "",
    };

    setProfile(data);
    setInitialProfile(data);
  }, [user]);

  // ⛔ ahora sí podemos salir temprano
  if (loading || !user || !initialProfile) {
    return null;
  }

  const hasChanges =
    profile.display_name !== initialProfile.display_name ||
    profile.email !== initialProfile.email ||
    profile.avatar_url !== initialProfile.avatar_url ||
    profile.password.length > 0;


    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const payload = buildPayload();

            await updateProfile(payload);

            onClose(); // cerramos modal
            window.dispatchEvent(
            new Event("trackly:user-updated")
            );
        } catch {
            setError("No se pudo guardar el perfil");
        } finally {
            setSaving(false);
        }
        };


    const buildPayload = () => {
        const payload: {
            display_name?: string;
            avatar_url?: string;
            email?: string;
            password?: string;
        } = {};

        if (
            profile.display_name !==
            initialProfile.display_name
        ) {
            payload.display_name =
            profile.display_name.trim();
        }

        if (
            profile.avatar_url !==
            initialProfile.avatar_url
        ) {
            const avatar = profile.avatar_url.trim();
            if (avatar) payload.avatar_url = avatar;
        }

        if (profile.email !== initialProfile.email) {
            payload.email = profile.email.trim();
        }

        if (profile.password.length > 0) {
            payload.password = profile.password;
        }

        return payload;
        };

  return (
    <div className="modal-overlay">
      <div className="modal-card large">
        <ProfilePreviewCard profile={profile} />

        <div className="profile-form">
          <label>
            Avatar URL
            <input
              value={profile.avatar_url}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  avatar_url: e.target.value,
                })
              }
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
            Contraseña
            <input
              type="password"
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