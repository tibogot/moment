import { cookies } from "next/headers";
import {
  CUSTOMER_SESSION_COOKIE,
  getSessionCookieOptions,
  isCustomerAccountConfigured,
} from "./config";

export type CustomerSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
};

export async function getCustomerSession(): Promise<CustomerSession | null> {
  if (!isCustomerAccountConfigured()) return null;

  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as CustomerSession;
    if (
      !session.accessToken ||
      !session.refreshToken ||
      !session.idToken ||
      !session.expiresAt
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setCustomerSession(session: CustomerSession) {
  const cookieStore = await cookies();
  const options = getSessionCookieOptions();
  cookieStore.set(options.name, JSON.stringify(session), options);
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

export async function isCustomerLoggedIn() {
  const session = await getCustomerSession();
  return Boolean(session?.accessToken);
}
