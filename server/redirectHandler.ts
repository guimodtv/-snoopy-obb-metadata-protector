import { Request, Response } from "express";
import { getShortLinkByCode } from "./db";

/**
 * Handler para redirecionar links encurtados
 * Busca a URL original e redireciona o usuário
 */
export async function handleRedirect(req: Request, res: Response) {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ error: "Short code is required" });
    }

    const link = await getShortLinkByCode(shortCode);

    if (!link || !link.isActive) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Retornar a URL original como JSON
    // O cliente (página intermediária) fará o redirecionamento
    return res.json({ url: link.originalUrl });
  } catch (error) {
    console.error("[Redirect Handler] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Handler para redirecionar diretamente (sem página intermediária)
 * Usado para links que não precisam de página de anúncio
 */
export async function handleDirectRedirect(req: Request, res: Response) {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ error: "Short code is required" });
    }

    const link = await getShortLinkByCode(shortCode);

    if (!link || !link.isActive) {
      return res.status(404).render("404", { message: "Link not found" });
    }

    // Redirecionar diretamente
    return res.redirect(301, link.originalUrl);
  } catch (error) {
    console.error("[Direct Redirect Handler] Error:", error);
    return res.status(500).send("Internal server error");
  }
}
