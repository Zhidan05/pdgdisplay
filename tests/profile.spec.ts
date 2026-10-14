import { test, expect } from "@playwright/test";

const MOCK_USER = {
  id: "e4b3c2a1-5678-90ab-cdef-1234567890ab",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@rri.co.id",
  email_confirmed_at: "2026-01-15T08:30:00Z",
  created_at: "2026-01-15T08:30:00Z",
  app_metadata: { provider: "email" },
  user_metadata: {},
};

test.describe("Admin Profile Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept token login endpoint
    await page.route("**/auth/v1/token?grant_type=password*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: MOCK_USER,
        }),
      });
    });

    // Intercept getUser calls
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    // Perform login to establish authenticated session
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("admin@rri.co.id");
    await page.locator('input[type="password"]').fill("secret123");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForURL("**/admin");
  });

  test("1. Profile displays logged-in user email, ID, and created date", async ({ page }) => {
    await page.goto("/admin/profile");

    // Check heading
    await expect(page.locator("h1")).toContainText("Profil Admin");

    // Check Informasi Akun cards
    await expect(page.locator(".profile-info-value").nth(0)).toContainText("admin@rri.co.id");
    await expect(page.locator(".profile-info-value").nth(1)).toContainText(MOCK_USER.id);
    await expect(page.locator(".profile-info-value").nth(2)).toBeVisible();

    // Check email in read-only field
    const currentEmailInput = page.getByLabel("Email Saat Ini");
    await expect(currentEmailInput).toHaveValue("admin@rri.co.id");
    await expect(currentEmailInput).toBeDisabled();

    await page.screenshot({ path: "test-results/admin-profile-desktop.png", fullPage: true });
  });

  test("2. Navigation and sidebar includes Profil Admin with active indicator", async ({ page }) => {
    await page.goto("/admin/profile");

    // Check sidebar navigation item
    const navLink = page
      .getByRole("navigation", { name: "Navigasi admin" })
      .getByRole("link", { name: "Profil Admin", exact: true });
    await expect(navLink).toBeVisible();
    await expect(navLink).toHaveClass(/active/);

    // Check operator avatar in header links to profile
    const avatar = page.locator(".operator-avatar");
    await expect(avatar).toHaveAttribute("href", "/admin/profile");
  });

  test("3. Mobile drawer displays Profil Admin and is responsive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin");

    const hamburger = page.locator(".sidebar-toggle");
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const profileLink = page.getByRole("link", { name: "Profil Admin", exact: true });
    await expect(profileLink).toBeVisible();

    await profileLink.click();
    await expect(page).toHaveURL(/.*\/admin\/profile/);
    await expect(page.locator("h1")).toContainText("Profil Admin");
    await page.screenshot({ path: "test-results/admin-profile-mobile.png", fullPage: true });
  });

  test("4. Password toggle button shows and hides characters", async ({ page }) => {
    await page.goto("/admin/profile");

    const newPassInput = page.getByPlaceholder("Ketik password baru (min. 6 karakter)");
    await expect(newPassInput).toHaveAttribute("type", "password");

    // Click toggle button for new password
    const toggleButtons = page.locator(".password-toggle-btn");
    await toggleButtons.nth(2).click();
    await expect(newPassInput).toHaveAttribute("type", "text");

    await toggleButtons.nth(2).click();
    await expect(newPassInput).toHaveAttribute("type", "password");
  });

  test("5. Email change validations: empty, invalid format, same email", async ({ page }) => {
    await page.goto("/admin/profile");

    const newEmailInput = page.getByPlaceholder("admin-baru@rri.co.id");
    const currentPassInput = page.getByPlaceholder("Ketik password saat ini");
    const saveEmailBtn = page.getByRole("button", { name: "Simpan Email" });

    // Test same email
    await newEmailInput.fill("admin@rri.co.id");
    await currentPassInput.fill("password123");
    await saveEmailBtn.click();
    await expect(page.locator(".form-error")).toContainText("Email baru tidak boleh sama dengan email saat ini.");

    // Test invalid format
    await newEmailInput.fill("invalid-email-format");
    await saveEmailBtn.click();
    await expect(page.locator(".form-error")).toContainText("Format email baru tidak valid.");
  });

  test("6. Email change rejection on incorrect current password", async ({ page }) => {
    // Override token endpoint to reject password re-verification
    await page.route("**/auth/v1/token?grant_type=password*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.goto("/admin/profile");

    const newEmailInput = page.getByPlaceholder("admin-baru@rri.co.id");
    const currentPassInput = page.getByPlaceholder("Ketik password saat ini");
    const saveEmailBtn = page.getByRole("button", { name: "Simpan Email" });

    await newEmailInput.fill("admin-baru@rri.co.id");
    await currentPassInput.fill("wrongpassword");
    await saveEmailBtn.click();

    // Check error message
    await expect(page.locator(".form-error")).toContainText("Password saat ini salah. Perubahan email ditolak.");
    // Password input must be cleared immediately (never display plain text)
    await expect(currentPassInput).toHaveValue("");
  });

  test("7. Email change success with pending confirmation handling", async ({ page }) => {
    // Intercept updateUser to return pending confirmation
    await page.route("**/auth/v1/user*", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...MOCK_USER,
            new_email: "admin-baru@rri.co.id",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      }
    });

    await page.goto("/admin/profile");

    const newEmailInput = page.getByPlaceholder("admin-baru@rri.co.id");
    const currentPassInput = page.getByPlaceholder("Ketik password saat ini");
    const saveEmailBtn = page.getByRole("button", { name: "Simpan Email" });

    await newEmailInput.fill("admin-baru@rri.co.id");
    await currentPassInput.fill("correctpassword");
    await saveEmailBtn.click();

    // Check success notice mentions the pending email confirmation
    await expect(page.locator(".notice")).toContainText("Tautan konfirmasi telah dikirimkan ke email baru (admin-baru@rri.co.id)");
    // Field must be reset
    await expect(newEmailInput).toHaveValue("");
    await expect(currentPassInput).toHaveValue("");
  });

  test("8. Password change validations: length, mismatch, same as old", async ({ page }) => {
    await page.goto("/admin/profile");

    const oldPassInput = page.getByPlaceholder("Ketik password lama");
    const newPassInput = page.getByPlaceholder("Ketik password baru (min. 6 karakter)");
    const confirmPassInput = page.getByPlaceholder("Ketik ulang password baru");
    const changePassBtn = page.getByRole("button", { name: "Ganti Password" });

    // 1. Length < 6
    await oldPassInput.fill("oldpass123");
    await newPassInput.fill("12345");
    await confirmPassInput.fill("12345");
    await changePassBtn.click();
    await expect(page.locator(".form-error")).toContainText("minimal 6 karakter");

    // 2. Mismatch with confirm password
    await newPassInput.fill("newpassword123");
    await confirmPassInput.fill("differentpass123");
    await changePassBtn.click();
    await expect(page.locator(".form-error")).toContainText("tidak cocok");

    // 3. Same as old password
    await newPassInput.fill("oldpass123");
    await confirmPassInput.fill("oldpass123");
    await changePassBtn.click();
    await expect(page.locator(".form-error")).toContainText("tidak boleh sama dengan password lama");
  });

  test("9. Password change rejection when old password is wrong", async ({ page }) => {
    // Intercept signInWithPassword to fail
    await page.route("**/auth/v1/token?grant_type=password*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.goto("/admin/profile");

    const oldPassInput = page.getByPlaceholder("Ketik password lama");
    const newPassInput = page.getByPlaceholder("Ketik password baru (min. 6 karakter)");
    const confirmPassInput = page.getByPlaceholder("Ketik ulang password baru");
    const changePassBtn = page.getByRole("button", { name: "Ganti Password" });

    await oldPassInput.fill("wrongoldpass");
    await newPassInput.fill("newpassword123");
    await confirmPassInput.fill("newpassword123");
    await changePassBtn.click();

    await expect(page.locator(".form-error")).toContainText("Password lama salah. Perubahan password ditolak.");
    // Old password field should be cleared
    await expect(oldPassInput).toHaveValue("");
  });

  test("10. Password change success with valid data clears all password fields", async ({ page }) => {
    // Intercept updateUser password to succeed
    await page.route("**/auth/v1/user*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    await page.goto("/admin/profile");

    const oldPassInput = page.getByPlaceholder("Ketik password lama");
    const newPassInput = page.getByPlaceholder("Ketik password baru (min. 6 karakter)");
    const confirmPassInput = page.getByPlaceholder("Ketik ulang password baru");
    const changePassBtn = page.getByRole("button", { name: "Ganti Password" });

    await oldPassInput.fill("correctoldpass123");
    await newPassInput.fill("brandnewpassword456");
    await confirmPassInput.fill("brandnewpassword456");
    await changePassBtn.click();

    // Check success notice
    await expect(page.locator(".notice")).toContainText("Password berhasil diperbarui.");

    // All password fields must be cleared
    await expect(oldPassInput).toHaveValue("");
    await expect(newPassInput).toHaveValue("");
    await expect(confirmPassInput).toHaveValue("");
  });
});
