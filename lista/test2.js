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
const openCatBtn = document.getElementById("openCatBtn");      // botão que abre o modal
const addBtn = document.getElementById("addBtn");              // botão de adicionar dentro do modal
const modalTitle = document.getElementById("modalTitle");      // título do modal
let modalMode = 'item';                                        // 'item' ou 'category'

/* mostrarModal: abre o overlay/modal e limpa/posiciona os inputs */
function mostrarModal(mode = 'item') {
    modalMode = mode;
    overlay.classList.remove("hidden");   // revela o overlay

    // limpa campos básicos
    nomeInput.value = "";                 // limpa campo nome
    qtdInput.value = "";                  // limpa campo quantidade
    select.value = "geral";               // reseta select para valor padrão

    // ajusta UI conforme modo
    if (modalMode === 'category') {
        modalTitle.textContent = "Adicionar Categoria";
        addBtn.textContent = "ADICIONAR CATEGORIA";
        qtdInput.style.display = "none";
        // mostrar o select para que o usuário veja as categorias existentes
        select.style.display = "";
    } else {
        modalTitle.textContent = "Adicionar Item";
        addBtn.textContent = "ADICIONAR";
        qtdInput.style.display = "";
        select.style.display = "";
    }

    nomeInput.focus();                    // foca o input de nome
}

/* fecharModal:
   - se chamado via clique no overlay, o evento terá target igual ao próprio overlay e fecha
   - se chamado sem evento (ex: botão CANCELAR com onclick="fecharModal()") fecha direto
*/
function fecharModal(event) {
    if (event && event.type === 'click' && event.target !== overlay) return;
    overlay.classList.add("hidden");
    // reset to defaults so modal is consistent next time
    qtdInput.style.display = "";
    select.style.display = "";
    modalMode = 'item';
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

    // checar duplicata (comparação case-insensitive)
    const exists = Array.from(lista.querySelectorAll('.cell-item'))
        .some(td => td.textContent.trim().toLowerCase() === nomeItem.toLowerCase());
    if (exists) {
        alert("Esse item já existe na lista! 😅");
        nomeInput.focus();
        return;
    }

    // cria a linha da tabela
    const tr = document.createElement("tr");

    // innerHTML com as 5 células (checkbox + item + quantidade + categoria + ações):
    tr.innerHTML = `
        <td class="cell-check"><input type="checkbox" class="row-checkbox" aria-label="Marcar item como concluído"></td>
        <td class="cell-item">${nomeItem}</td>
        <td class="cell-qty">${qtdItem}</td>
        <td class="cell-cat"><span class="tag ${categoria}">${textoCategoria}</span></td>
        <td class="cell-actions">
            <!-- botão excluir: event.stopPropagation() no onclick evita que o clique suba e risque a linha -->
            <button class="delete-btn" onclick="deletarItem(this); event.stopPropagation();" aria-label="Excluir item">✖</button>
        </td>
    `;

    // anexa a nova linha ao tbody
    lista.appendChild(tr);

    // adicionar listener ao checkbox para marcar como concluído
    const checkbox = tr.querySelector('.row-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', function () {
            tr.classList.toggle('checked', this.checked);
        });
    }

    // fecha o modal após adicionar
    fecharModal();
}


/* adicionarCategoria:
   - valida o nome
   - adiciona uma nova opção ao select (evitando duplicatas)
*/
function adicionarCategoria() {
    const nomeRaw = nomeInput.value.trim();                     // valor bruto do input

    // validação simples: nome obrigatório
    if (nomeRaw === '') {
        alert("Escreve o nome da categoria! 😅");
        nomeInput.focus();
        return;
    }

    // capitaliza a primeira letra
    const nomeItem = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1);

    // cria um 'slug' simples para o value
    const slug = nomeRaw.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

    // checar duplicata entre opções do select
    const exists = Array.from(select.options)
        .some(opt => opt.value === slug || opt.text.trim().toLowerCase() === nomeItem.toLowerCase());
    if (exists) {
        alert('Essa categoria já existe! 😅');
        nomeInput.focus();
        return;
    }

    // cria e adiciona nova option
    const option = document.createElement('option');
    option.value = slug;
    option.text = nomeItem;
    select.appendChild(option);

    // seleciona a nova categoria e fecha modal
    select.value = slug;
    fecharModal();
}

/* riscarItem: função utilitária compatível caso queiramos chamar por referência.
   Aceita o elemento (pode ser um <tr> ou um filho dentro do <tr>) e alterna 'checked' na linha correspondente.
*/
function riscarItem(elemento) {
    const tr = elemento.tagName === 'TR' ? elemento : elemento.closest('tr');
    if (tr) {
        const checkbox = tr.querySelector('.row-checkbox');
        const newState = !tr.classList.contains('checked');
        tr.classList.toggle('checked', newState);
        if (checkbox) checkbox.checked = newState;
    }
}

/* deletarItem: dado o botão que foi clicado, encontra a linha pai e remove do DOM */
function deletarItem(botao) {
    const tr = botao.closest('tr');
    if (tr) tr.remove();
}

/* Função genérica que decide o que adicionar conforme o modo do modal */
function handleAdd() {
    if (modalMode === 'category') {
        adicionarCategoria();
    } else {
        adicionarItem();
    }
}

/* Atalho: pressionar Enter nos inputs aciona a ação apropriada (melhora usabilidade) */
nomeInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") handleAdd();
});
qtdInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") handleAdd();
});