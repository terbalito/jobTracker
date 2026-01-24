// firebaseAuthMiddleware.js
import { authAdmin } from "./firebaseAdmin.js";

export async function firebaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Non connecté" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await authAdmin.verifyIdToken(token);
    req.user = decoded; // { uid, email, ... }
    next();
  } catch (err) {
    res.status(401).json({ error: "Token Firebase invalide" });
  }
}
