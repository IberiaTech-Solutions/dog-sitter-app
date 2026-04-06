"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Card, Input, Textarea, Button, Avatar } from "@/components/ui";

type Profile = {
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  avatar_url: string | null;
  role: string;
};

export function ProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `avatars/${userId}/${Date.now()}-${safeName}`;

    const { data: upload, error } = await supabase.storage
      .from("visit-photos")
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (error) {
      toast.error(es ? "Error al subir la foto" : "Photo upload failed");
    } else if (upload) {
      const { data: { publicUrl } } = supabase.storage
        .from("visit-photos")
        .getPublicUrl(upload.path);
      setAvatarUrl(publicUrl);
    }

    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        city: city.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    if (error) {
      toast.error(es ? "No se pudo guardar" : "Could not save");
    } else {
      toast.success(es ? "Perfil actualizado" : "Profile updated");
      router.refresh();
    }

    setLoading(false);
  }

  const roleLabel = {
    owner: es ? "Dueño de mascota" : "Pet owner",
    sitter: es ? "Cuidador de mascotas" : "Pet sitter",
    both: es ? "Dueño y cuidador" : "Owner & sitter",
    admin: "Admin",
  }[profile.role] ?? profile.role;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-5">
          <Avatar name={fullName} src={avatarUrl} size="xl" />
          <div>
            <p className="text-sm font-medium text-stone-700">
              {es ? "Foto de perfil" : "Profile photo"}
            </p>
            <label className="mt-2 inline-flex items-center gap-2 cursor-pointer rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98]">
              {uploading
                ? es ? "Subiendo..." : "Uploading..."
                : es ? "Cambiar foto" : "Change photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Basic info */}
      <Card>
        <div className="space-y-4">
          <Input
            label={es ? "Nombre completo" : "Full name"}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {es ? "Correo electrónico" : "Email"}
            </label>
            <p className="text-sm text-stone-500 bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
              {profile.email}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {es ? "No se puede cambiar" : "Cannot be changed"}
            </p>
          </div>
          <Input
            label={es ? "Teléfono" : "Phone"}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={es ? "+34 600 000 000" : "+34 600 000 000"}
          />
          <Input
            label={es ? "Ciudad" : "City"}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={es ? "Gijón, Asturias" : "Gijón, Asturias"}
          />
        </div>
      </Card>

      {/* Bio */}
      <Card>
        <Textarea
          label={es ? "Sobre mí" : "About me"}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder={
            es
              ? "Cuéntanos un poco sobre ti..."
              : "Tell us a bit about yourself..."
          }
        />
      </Card>

      {/* Role info */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">
              {es ? "Tipo de cuenta" : "Account type"}
            </p>
            <p className="text-sm text-stone-500 mt-0.5">{roleLabel}</p>
          </div>
          <span className="text-xs text-stone-400 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
            {es ? "No se puede cambiar" : "Cannot be changed"}
          </span>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={loading || !fullName.trim()}
        size="lg"
        className="w-full rounded-full"
      >
        {loading
          ? es ? "Guardando..." : "Saving..."
          : es ? "Guardar perfil" : "Save profile"}
      </Button>
    </form>
  );
}
