// src/components/players/playerCard.js

const playerCardTemplate = document.createElement("template");
playerCardTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #011638;
      color: #ffffff;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
    }

    :host([active="false"]) {
      opacity: 0.5;
      filter: grayscale(80%);
    }

    .playerInfo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .playerName {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .playerDetails {
      font-size: 0.85rem;
      color: #8b9bb4;
      display: flex;
      gap: 1rem;
    }

    .positionBadge {
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
      color: #fff;
    }

    :host([position="Portero"]) .positionBadge { background-color: #f59e0b; }
    :host([position="Defensa"]) .positionBadge { background-color: #3b82f6; }
    :host([position="Mediocampista"]) .positionBadge { background-color: #10b981; }
    :host([position="Delantero"]) .positionBadge { background-color: #ef4444; }

    .cardActions {
      display: flex;
      gap: 0.5rem;
    }

    button {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.2s;
    }

    button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    button.btnDelete {
      border-color: #ef4444;
      color: #fca5a5;
    }

    button.btnDelete:hover {
      background: #ef4444;
      color: white;
    }
  </style>

  <div class="playerInfo">
    <div class="playerName">
      <span class="dorsalNumber">#<span id="numberSlot"></span></span> 
      <span id="nameSlot"></span>
    </div>
    <div class="playerDetails">
      <span id="teamSlot"></span>
      <span id="positionSlot" class="positionBadge"></span>
    </div>
  </div>

  <div class="cardActions">
    <button id="btnEdit">Editar</button>
    <button id="btnToggle">Desactivar</button>
    <button id="btnDelete" class="btnDelete">Eliminar</button>
  </div>
`;

export class PlayerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(playerCardTemplate.content.cloneNode(true));

    this.cardElements = {
      nameSlot: this.shadowRoot.getElementById("nameSlot"),
      numberSlot: this.shadowRoot.getElementById("numberSlot"),
      teamSlot: this.shadowRoot.getElementById("teamSlot"),
      positionSlot: this.shadowRoot.getElementById("positionSlot"),
      btnEdit: this.shadowRoot.getElementById("btnEdit"),
      btnToggle: this.shadowRoot.getElementById("btnToggle"),
      btnDelete: this.shadowRoot.getElementById("btnDelete")
    };
  }

  static get observedAttributes() {
    return ["name", "number", "position", "team", "active"];
  }

  connectedCallback() {
    console.log("Componente conectado");

    this.cardElements.btnEdit.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("edit", { detail: { id: this.getAttribute("id") } }));
    });

    this.cardElements.btnToggle.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("toggle", { detail: { id: this.getAttribute("id") } }));
    });

    this.cardElements.btnDelete.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("delete", { detail: { id: this.getAttribute("id") } }));
    });
  }

  disconnectedCallback() {
    console.log("Componente desconectado");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "name":
        if (this.cardElements.nameSlot) this.cardElements.nameSlot.textContent = newValue;
        break;
      case "number":
        if (this.cardElements.numberSlot) this.cardElements.numberSlot.textContent = newValue;
        break;
      case "team":
        if (this.cardElements.teamSlot) this.cardElements.teamSlot.textContent = newValue;
        break;
      case "position":
        if (this.cardElements.positionSlot) this.cardElements.positionSlot.textContent = newValue;
        break;
      case "active":
        if (this.cardElements.btnToggle) {
          this.cardElements.btnToggle.textContent = newValue === "true" ? "Desactivar" : "Activar";
        }
        break;
    }
  }
}

customElements.define("player-card", PlayerCard);
