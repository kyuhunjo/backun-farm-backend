import express from "express"
import compression from "compression"
import helmet from "helmet"
import dotenv from "dotenv"
import cors from "cors"

import localFoodRoutes from "./routes/localFood.js"
import weatherRoutes from "./routes/weatherRoutes.js"
import airQualityRoutes from "./routes/airQualityRoutes.js"
import sunriseRoutes from "./routes/sunriseRoutes.js"

dotenv.config()

const PORT = process.env.PORT || 8086

const app = express()

app.use(express.json())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gw.imjoe24.com",
    "https://gw-dev.imjoe24.com",
    "https://hs.imjoe24.com",
    "https://hs-api.imjoe24.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}))
app.use(compression())

app.use("/api/local-food", localFoodRoutes)
app.use("/api/weather", weatherRoutes)
app.use("/api/air-quality", airQualityRoutes)
app.use("/api/sunrise", sunriseRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`)
})

export default app
