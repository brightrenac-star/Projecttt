import { createRoot } from "react-dom/client";
import { WalletProvider } from "@suiet/wallet-kit";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <App />
  </WalletProvider>
);
