import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './style.scss';

document.addEventListener("DOMContentLoaded", function () {
    const element = document.getElementById("react_wp_admin");
    if (typeof element !== "undefined" && element !== null) {
        ReactDOM.render(<App />, document.getElementById("react_wp_admin"));
    }
});