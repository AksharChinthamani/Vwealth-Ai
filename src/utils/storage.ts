import { User, Investment } from "../types";

export const saveUsers = async (users: Record<string, User>): Promise<void> => {
  try {
    window.localStorage.setItem("vwealth_users", JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users", error);
  }
};

export const loadUsers = async (): Promise<Record<string, User>> => {
  try {
    const result = window.localStorage.getItem("vwealth_users");
    return result ? JSON.parse(result) : {};
  } catch (error) {
    console.error("Failed to load users", error);
    return {};
  }
};

export const savePortfolio = async (
  email: string,
  data: Investment[]
): Promise<void> => {
  try {
    const sanitizedEmail = email.replace(/[^a-z0-9]/gi, "_");
    window.localStorage.setItem(
      `vwealth_portfolio_${sanitizedEmail}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Failed to save portfolio", error);
  }
};

export const loadPortfolio = async (email: string): Promise<Investment[]> => {
  try {
    const sanitizedEmail = email.replace(/[^a-z0-9]/gi, "_");
    const result = window.localStorage.getItem(`vwealth_portfolio_${sanitizedEmail}`);
    return result ? JSON.parse(result) : [];
  } catch (error) {
    console.error("Failed to load portfolio", error);
    return [];
  }
};

// Session functions
export const saveSession = (email: string | null) => {
  try {
    if (email) {
      window.localStorage.setItem("vwealth_active_user", email);
    } else {
      window.localStorage.removeItem("vwealth_active_user");
    }
  } catch (e) {}
};

export const loadSession = (): string | null => {
  try {
    return window.localStorage.getItem("vwealth_active_user");
  } catch (e) {
    return null;
  }
};
