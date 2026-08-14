
import { listTeams } from "../services/teams.js";

export const renderTeamsView = async () => {

    // ==========================================
    // 1. BUSCAR EL CONTENEDOR
    // ==========================================

    const container = document.querySelector("#teams-container");

    if (!container) {
        throw new Error("No se encontró el contenedor de equipos.");
    }


    // ==========================================
    // 2. OBTENER LOS EQUIPOS
    // ==========================================

    const teams = await listTeams();


    // ==========================================
    // 3. LIMPIAR EL CONTENEDOR
    // ==========================================

    container.replaceChildren();


    // ==========================================
    // 4. CREAR LAS TARJETAS
    // ==========================================

    teams.forEach((team, index) => {

        const card = document.createElement("article");

        card.classList.add("team-card");

        card.setAttribute("data-team-id", team.id);
        card.setAttribute("data-group-id", team.groupId);


        // Código
        const code = document.createElement("p");
        code.textContent = team.code;


        // Nombre
        const name = document.createElement("h3");
        name.textContent = team.name;


        // Grupo
        const group = document.createElement("p");
        group.textContent = `Grupo: ${team.groupId}`;


        // Entrenador
        const coach = document.createElement("p");
        coach.textContent = `Entrenador: ${team.coach}`;


        // Agregar contenido
        card.append(code, name, group, coach);


        // ======================================
        // FOOTER
        // ======================================

        const footer = document.createElement("footer");

        footer.textContent = "Equipo participante";

        card.insertAdjacentElement("beforeend", footer);


        // ======================================
        // TARJETAS PARES
        // ======================================

        if ((index + 1) % 2 === 0) {
            card.classList.add("team-card-even");
        }


        // ======================================
        // EQUIPO CON ENTRENADOR
        // ======================================

        if (team.coach) {
            card.classList.add("has-coach");
        }


        // ======================================
        // ATRIBUTO TEMPORAL
        // ======================================

        card.setAttribute("data-temp", "true");
        card.removeAttribute("data-temp");


        // ======================================
        // INSERTAR TARJETA
        // ======================================

        container.append(card);


        // ======================================
        // NAVEGACIÓN DOM
        // ======================================

        console.log("Padre de la tarjeta:", card.parentElement);


        // ======================================
        // ANIMACIÓN
        // ======================================

        card.animate(
            [
                {
                    opacity: 0,
                    transform: "translateY(20px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0)"
                }
            ],
            {
                duration: 500,
                delay: index * 150,
                fill: "both"
            }
        );
    });


    // ==========================================
    // 5. BUSCAR TODAS LAS TARJETAS
    // ==========================================

    const cards = container.querySelectorAll(".team-card");


    // ==========================================
    // 6. COMPROBAR ATRIBUTOS Y CLASES
    // ==========================================

    cards.forEach(card => {

        const teamId = card.getAttribute("data-team-id");

        const groupId = card.getAttribute("data-group-id");

        console.log(
            `Equipo ${teamId} pertenece al grupo ${groupId}`
        );


        if (card.classList.contains("team-card-even")) {
            console.log("Tarjeta par:", teamId);
        }


        if (card.classList.contains("has-coach")) {
            console.log("Tiene entrenador:", teamId);
        }

    });


    // ==========================================
    // 7. TOGGLE Y REPLACE
    // ==========================================

    if (cards.length > 0) {

        cards[0].classList.toggle("highlighted");

        cards[0].classList.add("first-team");

        cards[0].classList.replace(
            "first-team",
            "featured-team"
        );

    }


    // ==========================================
    // 8. DEVOLVER INFORMACIÓN
    // ==========================================

    return {
        teamsRendered: teams.length,
        cardsRendered: cards.length
    };
};