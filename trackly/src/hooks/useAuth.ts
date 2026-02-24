import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

import type { PublicUser } from "../types/user";
import type { PublicUserDTO } from "../types/user.dto";

import { adaptUserFromApi } from "../infra/adapters/userAdapter";

export function useAuth() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const dto: PublicUserDTO | null = await getCurrentUser();

        if (!mounted) return;

        if (!dto) {
          setUser(null);
        } else {
          setUser(adaptUserFromApi(dto));
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMe();

    const refresh = () => {
      fetchMe();
    };

    window.addEventListener("trackly:user-updated", refresh);

    return () => {
      mounted = false;
      window.removeEventListener("trackly:user-updated", refresh);
    };
  }, []);

  return { user, loading };
}