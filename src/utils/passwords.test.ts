import { comparePasswords, hashPassword } from "./passwords.ts";

test("hashPassword should return hashed string", async () => {
  const password = "myPassword";
  const hashed = await hashPassword(password);
  expect(hashed).not.toBe(password);
  expect(hashed).toMatch(/^\$2[ayb]\$.{56}$/);
});

test("comparePasswords should return true for matching password", async () => {
  const password = "myPassword";
  const hashed = await hashPassword(password);

  await expect(comparePasswords(password, hashed)).resolves.toBe(true);
});

test("comparePasswords should return false for non-matching password", async () => {
  const hashed = await hashPassword("myPassword");

  await expect(comparePasswords("wrongPassword", hashed)).resolves.toBe(false);
});
