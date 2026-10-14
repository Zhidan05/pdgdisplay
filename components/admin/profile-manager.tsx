"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  UserRound,
  Mail,
  KeyRound,
  Calendar,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  Save,
} from "lucide-react";
import { createClient } from "@/util/supabase/client";
import { PageHeading, Notice, Field } from "./admin-ui";

export function ProfileManager() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Form Ganti Email State
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // Form Ganti Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load current authenticated user data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);
      } catch {
        if (isMounted) {
          router.push("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Refresh user data after profile updates
  const refreshUserData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch {
      // Ignored
    }
  };

  // Copy User ID to clipboard
  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Format date helper in Indonesian
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Handle Ganti Email
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!user || !user.email) {
      setEmailError("Sesi Anda telah kedaluwarsa. Silakan login kembali.");
      router.push("/login");
      return;
    }

    const trimmedNewEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Validasi email baru
    if (!trimmedNewEmail) {
      setEmailError("Email baru wajib diisi.");
      return;
    }

    if (!emailRegex.test(trimmedNewEmail)) {
      setEmailError("Format email baru tidak valid.");
      return;
    }

    // 2. Email baru tidak boleh sama dengan email saat ini
    if (trimmedNewEmail === user.email.toLowerCase()) {
      setEmailError("Email baru tidak boleh sama dengan email saat ini.");
      return;
    }

    // 3. Password saat ini wajib diisi
    if (!currentPassword) {
      setEmailError("Password saat ini wajib dimasukkan untuk mengonfirmasi perubahan email.");
      return;
    }

    setEmailLoading(true);
    const supabase = createClient();

    try {
      // 4. Verifikasi password saat ini via Supabase Auth
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      // Clear password immediately from state
      setCurrentPassword("");

      if (verifyError) {
        setEmailLoading(false);
        setEmailError("Password saat ini salah. Perubahan email ditolak.");
        return;
      }

      // 5. Update email via Supabase Auth API
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email: trimmedNewEmail,
      });

      setEmailLoading(false);

      if (updateError) {
        const errorMsg = updateError.message.toLowerCase();
        if (
          errorMsg.includes("already registered") ||
          errorMsg.includes("already in use") ||
          updateError.status === 422
        ) {
          setEmailError("Email baru sudah digunakan oleh akun lain. Silakan gunakan alamat email lain.");
        } else {
          setEmailError(updateError.message || "Gagal memperbarui email.");
        }
        return;
      }

      // 6. Tangani status konfirmasi email
      setNewEmail("");

      if (updateData.user?.new_email) {
        setEmailSuccess(
          `Permintaan berhasil! Tautan konfirmasi telah dikirimkan ke email baru (${updateData.user.new_email}). Silakan periksa inbox/spam email tersebut untuk menyelesaikan perubahan.`
        );
      } else if (updateData.user?.email?.toLowerCase() === trimmedNewEmail) {
        setEmailSuccess(`Email akun berhasil diperbarui menjadi ${trimmedNewEmail}.`);
      } else {
        setEmailSuccess("Permintaan perubahan email telah diproses. Periksa email Anda untuk verifikasi.");
      }

      // Refresh data akun
      await refreshUserData();
    } catch (err: unknown) {
      setEmailLoading(false);
      setCurrentPassword("");
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses perubahan email.";
      setEmailError(msg);
    }
  };

  // Handle Ganti Password
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!user || !user.email) {
      setPasswordError("Sesi Anda telah kedaluwarsa. Silakan login kembali.");
      router.push("/login");
      return;
    }

    // 1. Validasi field
    if (!oldPassword) {
      setPasswordError("Password lama wajib diisi.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter sesuai kebijakan autentikasi.");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Konfirmasi password baru wajib diisi.");
      return;
    }

    // 2. Validasi kecocokan password baru
    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }

    // 3. Password baru tidak boleh sama dengan password lama
    if (newPassword === oldPassword) {
      setPasswordError("Password baru tidak boleh sama dengan password lama.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();

    try {
      // 4. Verifikasi password lama via Supabase Auth
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (verifyError) {
        setPasswordLoading(false);
        setOldPassword("");
        setPasswordError("Password lama salah. Perubahan password ditolak.");
        return;
      }

      // 5. Update password via Supabase Auth API
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setPasswordLoading(false);

      // Kosongkan seluruh field password
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (updateError) {
        setPasswordError(updateError.message || "Gagal memperbarui password.");
        return;
      }

      // 6. Notifikasi keberhasilan
      setPasswordSuccess("Password berhasil diperbarui.");
    } catch (err: unknown) {
      setPasswordLoading(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses perubahan password.";
      setPasswordError(msg);
    }
  };

  if (isLoadingUser) {
    return (
      <>
        <PageHeading
          title="Profil Admin"
          description="Informasi akun administrator dan pengelolaan kredensial."
        />
        <div className="panel profile-panel" style={{ textAlign: "center", padding: "40px" }}>
          <p className="text-secondary">Memuat informasi akun...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <PageHeading
        title="Profil Admin"
        description="Informasi akun administrator dan pengelolaan kredensial."
      />

      {/* 1. INFORMASI AKUN */}
      <section className="panel profile-panel profile-account-card">
        <div>
          <h2>
            <UserRound size={20} />
            Informasi Akun
          </h2>
          <p className="section-desc">
            Rincian data akun yang saat ini aktif dan terautentikasi di konsol admin.
          </p>
        </div>

        {/* Warning banner if there is a pending email change */}
        {user.new_email && (
          <div
            className="notice"
            role="status"
            style={{
              background: "rgba(255, 122, 0, 0.12)",
              borderColor: "rgba(255, 122, 0, 0.35)",
              color: "#ffbe82",
            }}
          >
            <ShieldAlert size={18} style={{ color: "#ffaa55" }} />
            <div>
              <strong>Perubahan Email Menunggu Konfirmasi:</strong>
              <div style={{ marginTop: "2px" }}>
                Permintaan pergantian email ke <strong>{user.new_email}</strong> sedang menunggu verifikasi tautan konfirmasi. Email baru akan aktif setelah Anda mengonfirmasinya.
              </div>
            </div>
          </div>
        )}

        <div className="profile-info-grid">
          {/* Card: Email Saat Ini */}
          <div className="profile-info-card">
            <div className="profile-info-card-header">
              <span className="profile-info-label">
                <Mail size={15} />
                Email Saat Ini
              </span>
              <span className="profile-badge verified">
                <CheckCircle2 size={12} />
                Aktif
              </span>
            </div>
            <div className="profile-info-value">{user.email}</div>
          </div>

          {/* Card: User ID */}
          <div className="profile-info-card">
            <div className="profile-info-card-header">
              <span className="profile-info-label">
                <Fingerprint size={15} />
                ID Pengguna
              </span>
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopyId}
                title="Salin User ID"
                aria-label="Salin User ID"
              >
                {copiedId ? <Check size={14} color="#22d99a" /> : <Copy size={14} />}
              </button>
            </div>
            <div
              className="profile-info-value"
              style={{ fontFamily: "var(--font-mono), monospace", fontSize: "13px" }}
            >
              {user.id}
            </div>
          </div>

          {/* Card: Tanggal Akun Dibuat */}
          <div className="profile-info-card">
            <div className="profile-info-card-header">
              <span className="profile-info-label">
                <Calendar size={15} />
                Akun Dibuat
              </span>
            </div>
            <div className="profile-info-value">
              {formatDate(user.created_at)}
            </div>
          </div>
        </div>
      </section>

      {/* 2 & 3. DUA KOLOM: GANTI EMAIL & GANTI PASSWORD */}
      <div className="profile-grid">
        {/* 2. FORM GANTI EMAIL */}
        <section className="panel profile-panel">
          <h2>
            <Mail size={20} />
            Ganti Email
          </h2>
          <p className="section-desc">
            Perbarui alamat email akun admin. Konfirmasi password saat ini diperlukan sebelum perubahan diproses.
          </p>

          <Notice message={emailSuccess} />

          <form onSubmit={handleEmailSubmit} className="form-stack" noValidate>
            {/* Email Saat Ini (read only) */}
            <Field
              label="Email Saat Ini"
              hint="Email akun yang saat ini terdaftar dan sedang digunakan."
            >
              <input
                type="email"
                value={user.email || ""}
                disabled
                readOnly
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </Field>

            {/* Email Baru */}
            <Field
              label="Email Baru"
              hint="Masukkan alamat email baru yang valid dan aktif."
            >
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="admin-baru@rri.co.id"
                required
                disabled={emailLoading}
                autoComplete="email"
              />
            </Field>

            {/* Password Saat Ini */}
            <Field
              label="Password Saat Ini"
              hint="Wajib dimasukkan untuk memverifikasi kepemilikan akun."
            >
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="Ketik password saat ini"
                  required
                  disabled={emailLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {emailError && (
              <p role="alert" className="form-error" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{emailError}</span>
              </p>
            )}

            <div className="form-actions" style={{ marginTop: "16px" }}>
              <button
                type="submit"
                formNoValidate
                className="button primary"
                disabled={emailLoading}
                style={{ minWidth: "140px" }}
              >
                {emailLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <Save size={16} />
                    Simpan Email
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* 3. FORM GANTI PASSWORD */}
        <section className="panel profile-panel">
          <h2>
            <KeyRound size={20} />
            Ganti Password
          </h2>
          <p className="section-desc">
            Perbarui kata sandi akun admin. Password lama akan diverifikasi terlebih dahulu sebelum perubahan diizinkan.
          </p>

          <Notice message={passwordSuccess} />

          <form onSubmit={handlePasswordSubmit} className="form-stack" noValidate>
            {/* Password Lama */}
            <Field
              label="Password Lama"
              hint="Masukkan password lama yang saat ini Anda gunakan."
            >
              <div className="password-input-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Ketik password lama"
                  required
                  disabled={passwordLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={showOldPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {/* Password Baru */}
            <Field
              label="Password Baru"
              hint="Minimal 6 karakter. Kombinasikan huruf dan angka untuk keamanan optimal."
            >
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Ketik password baru (min. 6 karakter)"
                  required
                  disabled={passwordLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {/* Konfirmasi Password Baru */}
            <Field
              label="Konfirmasi Password Baru"
              hint="Ketik ulang password baru untuk memastikan tidak ada salah ketik."
            >
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Ketik ulang password baru"
                  required
                  disabled={passwordLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {passwordError && (
              <p role="alert" className="form-error" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </p>
            )}

            <div className="form-actions" style={{ marginTop: "16px" }}>
              <button
                type="submit"
                formNoValidate
                className="button primary"
                disabled={passwordLoading}
                style={{ minWidth: "150px" }}
              >
                {passwordLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <KeyRound size={16} />
                    Ganti Password
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
