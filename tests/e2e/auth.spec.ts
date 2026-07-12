import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("logs in with demo credentials and reaches the dashboard", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
  await expect(page.getByText("Your activity")).toBeVisible();
});

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});
