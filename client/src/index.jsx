import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import store from "./redux/store.js";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <HashRouter>
            <ThemeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
            </ThemeProvider>
        </HashRouter>
    </Provider>
);
