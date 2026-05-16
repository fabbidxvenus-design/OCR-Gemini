import { test, expect, Page } from '@playwright/test';

/**
 * Visual Verification Suite for OCR Mobile Web App
 * Industrial Utility + AI Trust theme (teal primary #0F766E)
 * Verifies all routes across mobile (390x844), tablet (768x1024), desktop (1280x800)
 */

// ─── Auth session seed ────────────────────────────────────────────────────────

/** Pre-seed Zustand auth store (localStorage 'auth-storage') so ProtectedRoute passes. */
async function seedAuthSession(page: Page) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8h from now
  await page.goto('/');
  await page.evaluate(
    (exp) => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            isAuthenticated: true,
            user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
            accessToken: 'test-token',
            refreshToken: 'test-refresh',
            expiresAt: exp,
          },
          version: 0,
        })
      );
    },
    [expiresAt]
  );
  // Reload so Zustand picks up the persisted state
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// ─── Navigation helpers (responsive-aware) ────────────────────────────────────

/** Returns the primary navigation element for the current layout. */
async function getNavLocator(page: Page) {
  const bottomNav = page.locator('nav.bottom-0');
  if (await bottomNav.isVisible()) return bottomNav;
  const sidebarNav = page.locator('aside').getByRole('navigation');
  if (await sidebarNav.isVisible()) return sidebarNav;
  return page.locator('nav').filter({ visible: true }).first();
}

async function useMobileViewport(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
}

async function useTabletViewport(page: Page) {
  await page.setViewportSize({ width: 768, height: 1024 });
}

async function useDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
}

// ─── Route tests ─────────────────────────────────────────────────────────────

test.describe('Login Page', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Page title text visible
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible();

    // Vietnamese description visible
    await expect(page.locator('p').filter({ hasText: /AI|công cụ/i }).first()).toBeVisible();

    // Form elements visible
    await expect(page.getByPlaceholder(/email@example\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/nhập mật khẩu/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible();

    // No bottom nav on login
    await expect(page.locator('nav.bottom-0')).toHaveCount(0);

    await page.screenshot({ path: 'e2e/screenshots/login-mobile.png', fullPage: false });
  });

  test('loads correctly at tablet viewport', async ({ page }) => {
    await useTabletViewport(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/login-tablet.png', fullPage: false });
  });

  test('loads correctly at desktop viewport', async ({ page }) => {
    await useDesktopViewport(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/login-desktop.png', fullPage: false });
  });
});

test.describe('Register Page', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await page.goto('/register');
    await page.waitForLoadState('networkidle');    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/register-mobile.png', fullPage: false });
  });
});

test.describe('Camera Page (authenticated)', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await seedAuthSession(page);
    await page.goto('/camera');
    await page.waitForLoadState('domcontentloaded');

    // Page loads without redirect (auth works in mobile viewport)
    await expect(page).not.toHaveURL(/\/login/);

    // Camera view renders (upload or capture UI present)
    await expect(page.locator('body')).toBeVisible();
    const buttons = page.locator('button');
    const btnCount = await buttons.count();
    expect(btnCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/camera-mobile.png', fullPage: false });
  });

  test('loads correctly at tablet viewport', async ({ page }) => {
    await seedAuthSession(page);
    await useTabletViewport(page);
    await page.goto('/camera');
    await page.waitForLoadState('domcontentloaded');

    // Page loads without redirect
    await expect(page).not.toHaveURL(/\/login/);
    // Page has rendered content and camera controls
    await expect(page.locator('body')).toBeVisible();
    const buttons = page.locator('button');
    const btnCount = await buttons.count();
    expect(btnCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/camera-tablet.png', fullPage: false });
  });

  test('loads correctly at desktop viewport', async ({ page }) => {
    await seedAuthSession(page);
    await useDesktopViewport(page);
    await page.goto('/camera');
    await page.waitForLoadState('domcontentloaded');

    // Page loads without redirect
    await expect(page).not.toHaveURL(/\/login/);
    // Page has rendered content and camera controls
    await expect(page.locator('body')).toBeVisible();
    const buttons = page.locator('button');
    const btnCount = await buttons.count();
    expect(btnCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e/screenshots/camera-desktop.png', fullPage: false });
  });
});

test.describe('History Page (authenticated)', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');

    const nav = await getNavLocator(page);
    await expect(nav).toBeVisible();

    // Active nav state: history link has primary color or indicator
    const historyLink = page.locator('a[href="/history"]').filter({ visible: true }).first();
    await expect(historyLink).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/history-mobile.png', fullPage: false });
  });

  test('loads correctly at tablet viewport', async ({ page }) => {
    await useTabletViewport(page);
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/history-tablet.png', fullPage: false });
  });

  test('loads correctly at desktop viewport', async ({ page }) => {
    await useDesktopViewport(page);
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/history-desktop.png', fullPage: false });
  });
});

test.describe('Analytics Page (authenticated)', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await seedAuthSession(page);
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');

    const nav = await getNavLocator(page);
    await expect(nav).toBeVisible();

    const analyticsLink = page.locator('a[href="/analytics"]').filter({ visible: true }).first();
    await expect(analyticsLink).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/analytics-mobile.png', fullPage: false });
  });

  test('loads correctly at tablet viewport', async ({ page }) => {
    await useTabletViewport(page);
    await seedAuthSession(page);
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/analytics-tablet.png', fullPage: false });
  });

  test('loads correctly at desktop viewport', async ({ page }) => {
    await useDesktopViewport(page);
    await seedAuthSession(page);
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/analytics-desktop.png', fullPage: false });
  });
});

test.describe('Settings Page (authenticated)', () => {
  test('loads correctly at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await seedAuthSession(page);
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const nav = await getNavLocator(page);
    await expect(nav).toBeVisible();

    const settingsLink = page.locator('a[href="/settings"]').filter({ visible: true }).first();
    await expect(settingsLink).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/settings-mobile.png', fullPage: false });
  });

  test('loads correctly at tablet viewport', async ({ page }) => {
    await useTabletViewport(page);
    await seedAuthSession(page);
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/settings-tablet.png', fullPage: false });
  });

  test('loads correctly at desktop viewport', async ({ page }) => {
    await useDesktopViewport(page);
    await seedAuthSession(page);
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');    await expect(page.locator('aside').getByRole('navigation')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/settings-desktop.png', fullPage: false });
  });
});

test.describe('Navigation touch targets', () => {
  test('all nav links meet 44px minimum at mobile viewport', async ({ page }) => {
    await useMobileViewport(page);
    await seedAuthSession(page);
    await page.goto('/history'); // history page has full nav visible
    await page.waitForLoadState('networkidle');

    const bottomNav = page.locator('nav.bottom-0');
    await expect(bottomNav).toBeVisible();

    const navLinks = bottomNav.locator('a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      const minDim = Math.min(box!.width, box!.height);
      expect(minDim).toBeGreaterThanOrEqual(44);
    }

    await page.screenshot({ path: 'e2e/screenshots/nav-touch-targets-mobile.png', fullPage: false });
  });

  test('sidebar nav links meet 44px minimum at tablet viewport', async ({ page }) => {
    await useTabletViewport(page);
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');

    const sidebarNav = page.locator('aside').getByRole('navigation');
    await expect(sidebarNav).toBeVisible();

    const navLinks = sidebarNav.locator('a');
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      if (box) {
        const minDim = Math.min(box.width, box.height);
        expect(minDim).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
