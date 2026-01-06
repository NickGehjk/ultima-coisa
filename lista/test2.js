/* Lógica do app:
   - manipula DOM para abrir/fechar modal
   - cria linhas <tr> na tbody com cada item
   - permite riscar (marca) ao clicar na linha
   - permite remover item com o botão de excluir
   - suporta Enter nos inputs para adicionar rapidamente
*/

/* Referências aos elementos do DOM */
const nomeInput = document.getElementById("itemInput");         // campo do nome do item
const qtdInput = document.getElementById("qtdInput");          // campo da quantidade
const select = document.getElementById("categoriaSelect");     // select de categoria
const lista = document.getElementById("minhaLista");           // tbody onde inserimos as <tr>
const overlay = document.getElementById("overlay");            // overlay/modal container
const openAddBtn = document.getElementById("openAddBtn");      // botão que abre o modal

/* mostrarModal: abre o overlay/modal e limpa/posiciona os inputs */
function mostrarModal() {
    overlay.classList.remove("hidden");   // revela o overlay
    nomeInput.value = "";                 // limpa campo nome
    qtdInput.value = "";                  // limpa campo quantidade
    select.value = "geral";               // reseta select para valor padrão
    nomeInput.focus();                    // foca o input de nome
}

/* fecharModal:
   - se chamado via clique no overlay, o evento terá target igual ao próprio overlay e fecha
   - se chamado sem evento (ex: botão CANCELAR com onclick="fecharModal()") fecha direto
*/
function fecharModal(event) {
    if (event && event.type === 'click' && event.target !== overlay) return;
    overlay.classList.add("hidden");
}

/* adicionarItem:
   - valida o nome
   - cria um <tr> com 4 colunas: item, quantidade, categoria (com tag) e ações (botão excluir)
   - anexa listener de clique na linha para alternar o estado 'checked' (riscado)
   - adiciona ao tbody e fecha modal
*/
function adicionarItem() {
    const nomeRaw = nomeInput.value.trim();                     // valor bruto do input
    const qtdItem = qtdInput.value.trim();                     // quantidade informada
    const categoria = select.value;                            // valor da categoria (classe)
    const textoCategoria = select.options[select.selectedIndex].text; // texto legível da categoria

    // validação simples: nome obrigatório
    if (nomeRaw === '') {
        alert("Escreve o nome do item! 😅");
        nomeInput.focus();
        return;
    }

    // capitaliza a primeira letra do item
    const nomeItem = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1);

    // cria a linha da tabela
    const tr = document.createElement("tr");

    // innerHTML com as 4 células:
    // - cell-item: nome do item
    // - cell-qty: quantidade
    // - cell-cat: tag visual com a categoria
    // - cell-actions: botão excluir (que chama deletarItem passando o botão)
    tr.innerHTML = `
        <td class="cell-item">${nomeItem}</td>
        <td class="cell-qty">${qtdItem}</td>
        <td class="cell-cat"><span class="tag ${categoria}">${textoCategoria}</span></td>
        <td class="cell-actions">
            <!-- botão excluir: event.stopPropagation() no onclick evita que o clique suba e risque a linha -->
            <button class="delete-btn" onclick="deletarItem(this); event.stopPropagation();" aria-label="Excluir item">✖</button>
        </td>
    `;

    // clicar na linha alterna a classe 'checked' (visual de riscado)
    tr.addEventListener("click", function () {
        this.classList.toggle("checked");
    });

    // anexa a nova linha ao tbody
    lista.appendChild(tr);

    // fecha o modal após adicionar
    fecharModal();
}

/* riscarItem: função utilitária compatível caso queiramos chamar por referência.
   Aceita o elemento (pode ser um <tr> ou um filho dentro do <tr>) e alterna 'checked' na linha correspondente.
*/
function riscarItem(elemento) {
    const tr = elemento.tagName === 'TR' ? elemento : elemento.closest('tr');
    if (tr) tr.classList.toggle("checked");
}

/* deletarItem: dado o botão que foi clicado, encontra a linha pai e remove do DOM */
function deletarItem(botao) {
    const tr = botao.closest('tr');
    if (tr) tr.remove();
}

/* Atalho: pressionar Enter nos inputs adiciona o item (melhora usabilidade) */
nomeInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") adicionarItem();
});
qtdInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") adicionarItem();
});