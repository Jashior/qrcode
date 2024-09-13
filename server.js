import { handler } from "./build/handler.js";
import express from "express";

const app = express();

app.use(handler);

const PORT = process.env.PORT || 3131;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
