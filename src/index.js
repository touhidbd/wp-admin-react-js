import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './style.scss';

document.addEventListener("DOMContentLoaded", function () {
    const element = document.getElementById("wp_react_form");
    if (typeof element !== "undefined" && element !== null) {
        ReactDOM.render(<App />, document.getElementById("wp_react_form"));
    }
});