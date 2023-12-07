import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "My Drawing Board";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvas = document.createElement("canvas");

app.append(header, canvas);