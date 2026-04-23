import { nanoid } from "nanoid";
import * as crypto from "crypto";

/**
 * Gera um código único para link encurtado
 */
export function generateShortCode(): string {
  return nanoid(8);
}

/**
 * Gera um código de referência único
 */
export function generateReferralCode(): string {
  return nanoid(12);
}

/**
 * Gera uma API key única
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calcula o ganho por clique baseado no CPM
 * CPM = Cost Per Mille (por 1000 cliques)
 * Ganho por clique = CPM / 1000
 */
export function calculateEarningsPerClick(cpm: number): number {
  return cpm / 1000;
}

/**
 * Calcula a comissão de indicação
 */
export function calculateReferralCommission(
  earnings: number,
  commissionPercentage: number
): number {
  return (earnings * commissionPercentage) / 100;
}

/**
 * Valida uma URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detecta se um User-Agent é de um bot
 */
export function isBotUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) return false;

  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java(?!script)/i,
    /headless/i,
    /phantom/i,
    /selenium/i,
    /puppeteer/i,
    /playwright/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Valida um endereço IP
 */
export function isValidIp(ip: string): boolean {
  const ipv4Pattern =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Pattern = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Extrai o IP real do cliente considerando proxies
 */
export function extractClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
}

/**
 * Normaliza uma URL removendo protocolo e www
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return url;
  }
}

/**
 * Hash de senha com bcrypt (simulado com crypto para compatibilidade)
 * Em produção, use bcrypt real
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifica senha
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, storedHash] = hash.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Valida força da senha
 */
export function isStrongPassword(password: string): boolean {
  // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
  const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPattern.test(password);
}
