import './groupsStyles.css';
import { getGroups } from '../../api/groupsApi.js';
import { crearGrupo } from './createGroups.js';
import { editarGrupoCompleto } from './editGroups.js';
import { eliminarGrupo } from './deleteGroups.js';

export class GroupsComponent extends HTMLElement {
    constructor() {
        super();

        this.grupos = [];
        this.paginaActual = 1;
        this.resultadosPorPagina = 8;
        this.grupoParaEliminar = null;

        this.render();
        this.configurarEventos();
    }

    render() {
        this.innerHTML = /* html */ `
        <section class="groups-app">

        <nav class="groups-navbar" aria-label="Navegación principal">
            <a class="groups-logo" href="#inicio">FIFA</a>
            <a id="enlace-grupos" href="#grupos">Grupos</a>
            <a href="#equipos">Equipos</a>
            <a href="#jugadores">Jugadores</a>
            <a href="#partidos">Partidos</a>
            <a href="#goles">Goles</a>
        </nav>

        <main id="grupos" hidden>

            <header class="groups-header">
                <div>
                <p class="groups-eyebrow">COPA MUNDIAL 2026</p>
                <h1>Grupos</h1>
                </div>

                <div class="groups-toolbar">
                <input
                    id="buscar-grupos"
                    type="search"
                    placeholder="Buscar grupo"
                    aria-label="Buscar grupo"
                />

                <button
                    id="boton-abrir-crear"
                    class="groups-icon-button groups-button-primary"
                    type="button"
                    aria-label="Crear grupo"
                    title="Crear grupo"
                >
                    +
                </button>
                </div>
            </header>

            <p
                id="mensaje-confirmacion"
                hidden
                role="status"
                aria-live="polite"
            ></p>

            <section
                id="lista-grupos"
                class="groups-grid"
                aria-live="polite"
            ></section>

            <nav
                id="paginacion"
                class="groups-pagination"
                aria-label="Paginación de grupos"
            ></nav>

        </main>

        <!-- Modal crear / editar grupo -->
        <section
            id="modal-grupo"
            class="groups-modal"
            hidden
            aria-modal="true"
            role="dialog"
            aria-labelledby="titulo-modal"
        >

        <form id="formulario-grupo" class="groups-form">

            <div class="groups-modal-header">
                <h2 id="titulo-modal">Registrar grupo</h2>

                <button
                    id="boton-cerrar-modal"
                    class="groups-close"
                    type="button"
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>

            <input
                id="id-api"
                name="id"
                type="hidden"
            />

            <label>
                Código del grupo
                <input
                    name="code"
                    type="text"
                    maxlength="1"
                    required
                />
            </label>

            <label>
                Nombre del grupo
                <input
                    name="name"
                    type="text"
                    required
                />
            </label>

            <button
                id="boton-guardar"
                class="groups-save-button"
                type="submit"
            >
                Agregar
            </button>

        </form>
        </section>

        <!-- Modal eliminar -->
        <section
            id="modal-eliminar"
            class="groups-modal"
            hidden
            aria-modal="true"
            role="dialog"
            aria-labelledby="titulo-eliminar"
        >

        <div class="groups-confirmation">

            <h2 id="titulo-eliminar">
                ¿Eliminar grupo?
            </h2>

            <p>
                Esta acción no se podrá deshacer.
            </p>

            <div>

            <button
                id="boton-cancelar-eliminar"
                class="groups-icon-button"
                type="button"
                aria-label="Cancelar"
                title="Cancelar"
            >
                ×
            </button>

            <button
                id="boton-confirmar-eliminar"
                class="groups-icon-button groups-button-danger"
                type="button"
                aria-label="Confirmar eliminación"
                title="Confirmar eliminación"
            >
                ✓
            </button>

            </div>

        </div>
        </section>

        </section>
    `;
    }

    configurarEventos() {
        const q = (selector) => this.querySelector(selector);

        // Mostrar la sección de grupos y cargar los datos.
        q('#enlace-grupos').addEventListener('click', async (evento) => {
            evento.preventDefault();

            q('#grupos').hidden = false;
            q('#enlace-grupos').classList.add('activo');

            await this.cargarGrupos();
        });

        // Abrir modal para crear.
        q('#boton-abrir-crear').addEventListener('click', () => {
            this.abrirModalCrear();
        });

        // Cerrar modal.
        q('#boton-cerrar-modal').onclick = () => {
            q('#modal-grupo').hidden = true;
        };

        // Buscar grupos.
        q('#buscar-grupos').addEventListener('input', () => {
            this.paginaActual = 1;
            this.renderizarGrupos();
        });

        // Cambiar página.
        q('#paginacion').addEventListener('click', (evento) => {
            const boton = evento.target.closest('button[data-pagina]');

            if (!boton || boton.disabled) return;

            this.paginaActual = Number(boton.dataset.pagina);
            this.renderizarGrupos();
        });

        // Cancelar eliminación.
        q('#boton-cancelar-eliminar').onclick = () => {
            q('#modal-eliminar').hidden = true;
        };

        // Confirmar eliminación.
        q('#boton-confirmar-eliminar').onclick = async () => {
            await this.confirmarEliminacion();
        };

        // Crear o editar grupo.
        q('#formulario-grupo').addEventListener(
            'submit',
            async (evento) => {
                evento.preventDefault();

                const datos = Object.fromEntries(
                    new FormData(evento.currentTarget).entries()
                );

                const id = datos.id;

                delete datos.id;

                try {
                    let resultado;

                    if (id) {
                        resultado = await editarGrupoCompleto(
                            {
                                id,
                                code: datos.code.toUpperCase(),
                                name: datos.name,
                            },
                            id
                        );
                    } else {
                        resultado = await crearGrupo({
                            code: datos.code.toUpperCase(),
                            name: datos.name,
                        });
                    }

                    if (!resultado) {
                        throw new Error(
                            'La API no confirmó la operación. Revise la consola.'
                        );
                    }

                    this.mostrarMensaje(
                        id
                            ? 'Grupo actualizado correctamente.'
                            : 'Grupo creado correctamente.'
                    );

                    q('#modal-grupo').hidden = true;

                    await this.cargarGrupos();

                } catch (error) {
                    this.mostrarMensaje(
                        `No fue posible guardar el grupo: ${error.message}`,
                        true
                    );
                }
            }
        );

        // Botones de editar y eliminar.
        q('#lista-grupos').addEventListener(
            'click',
            async (evento) => {
                const boton = evento.target.closest('button[data-accion]');

                if (!boton) return;

                const grupo = this.grupos.find(
                    (item) => item.id === boton.dataset.id
                );

                if (!grupo) return;

                if (boton.dataset.accion === 'editar') {
                    this.abrirModalEditar(grupo);
                }

                if (boton.dataset.accion === 'eliminar') {
                    this.grupoParaEliminar = grupo;
                    q('#modal-eliminar').hidden = false;
                }
            }
        );
    }

    async cargarGrupos() {
        this.querySelector('#lista-grupos').innerHTML =
            '<p class="groups-loading">Cargando grupos…</p>';

        try {
            const grupos = await getGroups();

            this.grupos = grupos ?? [];

            this.renderizarGrupos();

        } catch (error) {
            this.mostrarMensaje(
                `No fue posible cargar los grupos: ${error.message}`,
                true
            );
        }
    }

    obtenerGruposFiltrados() {
        const texto = this
            .querySelector('#buscar-grupos')
            .value
            .toLowerCase()
            .trim();

        return this.grupos.filter((grupo) =>
            this.textoDelGrupo(grupo).includes(texto)
        );
    }

    textoDelGrupo(grupo) {
        return `${grupo.id} ${grupo.code} ${grupo.name}`.toLowerCase();
    }

    renderizarGrupos() {
        const filtrados = this.obtenerGruposFiltrados();

        const total = Math.max(
            1,
            Math.ceil(
                filtrados.length / this.resultadosPorPagina
            )
        );

        if (this.paginaActual > total) {
            this.paginaActual = total;
        }

        const inicio =
            (this.paginaActual - 1) *
            this.resultadosPorPagina;

        const pagina = filtrados.slice(
            inicio,
            inicio + this.resultadosPorPagina
        );

        const lista = this.querySelector('#lista-grupos');

        lista.innerHTML = pagina.length
            ? pagina
                .map(
                    (grupo) => /* html */ `
                <article class="group-card">

                    <p class="group-card-code">
                        Grupo ${grupo.code}
                    </p>

                    <h2>
                        ${grupo.name}
                    </h2>

                    <p class="group-card-id">
                        ID: ${grupo.id}
                    </p>

                <footer>

                    <span class="group-code">
                        ${grupo.code}
                    </span>

                    <div>

                    <button
                        class="groups-icon-button"
                        type="button"
                        data-accion="editar"
                        data-id="${grupo.id}"
                        aria-label="Editar grupo"
                        title="Editar grupo"
                    >
                        ✎
                    </button>

                    <button
                        class="groups-icon-button groups-button-danger"
                        type="button"
                        data-accion="eliminar"
                        data-id="${grupo.id}"
                        aria-label="Eliminar grupo"
                        title="Eliminar grupo"
                    >
                        🗑
                    </button>

                    </div>

                </footer>

                </article>
            `
                )
                .join('')
            : '<p class="groups-loading">No se encontraron grupos.</p>';

        // Solo se muestran cinco páginas.
        // La ventana se desplaza con la página activa.
        const primeraPaginaVisible = Math.max(
            1,
            Math.min(this.paginaActual - 2, total - 4)
        );

        const ultimaPaginaVisible = Math.min(
            total,
            primeraPaginaVisible + 4
        );

        const paginasVisibles = Array.from(
            {
                length:
                    ultimaPaginaVisible -
                    primeraPaginaVisible +
                    1,
            },
            (_, indice) =>
                primeraPaginaVisible + indice
        );

        this.querySelector('#paginacion').innerHTML = `
        <button
            class="pagination-arrow"
            data-pagina="${this.paginaActual - 1}"
            type="button"
            aria-label="Página anterior"
            ${this.paginaActual === 1 ? 'disabled' : ''}
        >
            ‹
        </button>

        ${paginasVisibles
                .map(
                    (pagina) => `
            <button
                class="${pagina === this.paginaActual ? 'activo' : ''}"
                data-pagina="${pagina}"
                type="button"
                aria-label="Página ${pagina}"
            >
                ${pagina}
            </button>
            `
                )
                .join('')}

        <button
            class="pagination-arrow"
            data-pagina="${this.paginaActual + 1}"
            type="button"
            aria-label="Página siguiente"
            ${this.paginaActual === total ? 'disabled' : ''}
        >
            ›
        </button>
    `;
    }

    abrirModalCrear() {
        const form = this.querySelector('#formulario-grupo');

        form.reset();

        form.querySelector('#id-api').value = '';

        form.elements.code.readOnly = false;

        this.querySelector('#titulo-modal').textContent =
            'Registrar grupo';

        this.querySelector('#boton-guardar').textContent =
            'Agregar';

        this.querySelector('#modal-grupo').hidden = false;
    }

    abrirModalEditar(grupo) {
        const form = this.querySelector('#formulario-grupo');

        Object.entries(grupo).forEach(
            ([campo, valor]) => {
                const entrada =
                    form.elements.namedItem(campo);

                if (entrada) {
                    entrada.value = valor;
                }
            }
        );

        form.querySelector('#id-api').value =
            grupo.id;

        form.elements.code.readOnly = true;

        this.querySelector('#titulo-modal').textContent =
            'Editar grupo';

        this.querySelector('#boton-guardar').textContent =
            'Actualizar';

        this.querySelector('#modal-grupo').hidden = false;
    }

    async confirmarEliminacion() {
        if (!this.grupoParaEliminar) return;

        const resultado = await eliminarGrupo(
            this.grupoParaEliminar.id
        );

        if (resultado) {
            this.querySelector('#modal-eliminar').hidden = true;

            this.mostrarMensaje(
                'Grupo eliminado correctamente.'
            );

            this.grupoParaEliminar = null;

            await this.cargarGrupos();
        }
    }

    mostrarMensaje(texto, esError = false) {
        const mensaje =
            this.querySelector(
                '#mensaje-confirmacion'
            );

        mensaje.textContent = texto;

        mensaje.classList.toggle(
            'groups-error',
            esError
        );

        mensaje.hidden = false;
    }
}

customElements.define(
    'groups-component',
    GroupsComponent
);