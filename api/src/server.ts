import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import dotenv from "dotenv";
import cors from "cors";

import alunoRoutes from "./routes/alunoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import disciplinaRoutes from "./routes/disciplinaRoutes.js";
import aulaRoutes from "./routes/aulaRoutes.js";
import questaoRoutes from "./routes/questaoRoutes.js";
import alternativaRoutes from "./routes/alternativaRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

app.use(alunoRoutes);
app.use(adminRoutes);
app.use(disciplinaRoutes);
app.use(aulaRoutes);
app.use(questaoRoutes);
app.use(alternativaRoutes);

// Captura os throw new Error() dos services e devolve HTTP 400
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(400).json({ mensagem: err.message });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
