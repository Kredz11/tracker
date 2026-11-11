import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateUrl, validateRequiredString } from "../../../src/utils/validators";
import { ValidationError } from "../../../src/utils/errors";

describe("validators", () => {
  it("validates correct email", () => {
    expect(() => validateEmail("test@example.com")).not.toThrow();
  });

  it("throws on invalid email", () => {
    expect(() => validateEmail("not-an-email")).toThrow(ValidationError);
  });

  it("validates strong password", () => {
    expect(() => validatePassword("password123")).not.toThrow();
  });

  it("throws on short password", () => {
    expect(() => validatePassword("123")).toThrow(ValidationError);
  });

  it("validates URL", () => {
    expect(() => validateUrl("https://example.com")).not.toThrow();
  });

  it("throws on invalid URL", () => {
    expect(() => validateUrl("not-a-url")).toThrow(ValidationError);
  });

  it("validates required string", () => {
    expect(validateRequiredString("hello", "field")).toBe("hello");
  });

  it("throws on empty string", () => {
    expect(() => validateRequiredString("", "field")).toThrow(ValidationError);
  });

  it("throws on non-string", () => {
    expect(() => validateRequiredString(123 as any, "field")).toThrow(ValidationError);
  });

  it("trims whitespace", () => {
    expect(validateRequiredString("  hello  ", "field")).toBe("hello");
  });
});
