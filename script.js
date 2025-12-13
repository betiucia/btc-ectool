let apiKey = ""; 
const STORAGE_KEY = 'btc_ectool';

// --- 1. GLOBAL VARIABLES & DATA ---
let currentLang = 'en'; // Default to English
let globalConfig = { sellMult: 2.0, buyMult: 0.5, p2pMargin: 30, imagePath: "", framework: 'rsg' };
let categories = [
];
let craftingTables = [
];
let items = [
];
let currentSort = { column: 'name', direction: 'asc' };

let modal, deleteModal, importModal, inputModal;
let itemToDeleteIndex = -1;
let deleteTargetType = null;
let inputModalCallback = null;

// --- 2. HELPER FUNCTIONS ---
function t(key, param1, param2) {
    if (!translations[currentLang]) return key;
    let str = translations[currentLang][key] || key;
    if (param1 !== undefined) str = str.replace('{0}', param1);
    if (param2 !== undefined) str = str.replace('{1}', param2);
    return str;
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang; 
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('[data-lang-title]').forEach(el => {
        const key = el.getAttribute('data-lang-title');
        if(translations[lang][key]) {
            el.setAttribute('data-tooltip', translations[lang][key]);
            el.removeAttribute('title'); 
        }
    });
    
    updateFrameworkTexts();
    document.getElementById('searchInput').placeholder = t('search_placeholder');
    saveLocalData(); 
    renderTable(); 
    
    renderCategories();
    renderCraftingTables();
}

function updateFrameworkTexts() {
    const frameName = globalConfig.framework ? globalConfig.framework.toUpperCase() : 'RSG';
    const header = document.getElementById('frameworkHeader');
    if(header) header.innerText = t('header_framework_data', frameName);
    
    const btnExport = document.getElementById('btnExportDef');
    if(btnExport) btnExport.innerText = t('btn_export_item_def', frameName);
    
    renderFrameworkFields(true); 
}

function normalizeText(text) { return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; }

function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) { toast = document.createElement("div"); toast.id = "toast"; toast.className = "toast"; document.body.appendChild(toast); }
    toast.innerText = message; toast.classList.add("show"); setTimeout(function(){ toast.classList.remove("show"); }, 3000);
}

function getTablesCheckboxesHTML(selectedTables = []) {
    let html = '<div class="tables-checkbox-grid">';
    craftingTables.forEach(t => {
        const checked = selectedTables.includes(t.id) ? 'checked' : '';
        html += `<label class="table-check-item"><input type="checkbox" value="${t.id}" class="table-checkbox" ${checked} onchange="previewPrices()"> ${t.name}</label>`;
    });
    html += '</div>';
    return html;
}

// --- 3. CUSTOM SEARCHABLE SELECT LOGIC ---
function renderItemSearchDropdown(selectedId, className) {
    let selectedName = "";
    let itemsHtml = "";
    items.forEach(i => {
        if(i.id === selectedId) selectedName = i.name;
        itemsHtml += `<div class="ds-item" onclick="selectItem(this, '${i.id}', '${i.name.replace(/'/g, "\\'")}')">${i.name} <small>${i.id}</small></div>`;
    });
    return `
    <div class="dropdown-search">
        <input type="text" class="ds-display" placeholder="${t('opt_select')}" value="${selectedName}" onfocus="toggleDropdown(this, true)" oninput="filterDropdown(this)">
        <input type="hidden" class="ds-value ${className}" value="${selectedId}" onchange="previewPrices()"> 
        <div class="ds-list">${itemsHtml}</div>
    </div>`;
}

function toggleDropdown(input, show) {
    const list = input.nextElementSibling.nextElementSibling;
    if (show) {
        document.querySelectorAll('.ds-list').forEach(l => l.style.display = 'none');
        list.style.display = 'block';
    } else {
        setTimeout(() => list.style.display = 'none', 200);
    }
}

function filterDropdown(input) {
    const filter = normalizeText(input.value);
    const list = input.nextElementSibling.nextElementSibling;
    const items = list.getElementsByClassName('ds-item');
    for (let i = 0; i < items.length; i++) {
        const txt = normalizeText(items[i].innerText);
        items[i].style.display = txt.includes(filter) ? "" : "none";
    }
}

function selectItem(div, id, name) {
    const container = div.parentElement.parentElement;
    const display = container.querySelector('.ds-display');
    const hidden = container.querySelector('.ds-value');
    display.value = name;
    hidden.value = id;
    previewPrices();
    div.parentElement.style.display = 'none';
}

window.addEventListener('click', function(e) {
    if (!e.target.matches('.ds-display')) {
        document.querySelectorAll('.ds-list').forEach(l => l.style.display = 'none');
    }
});

// --- 4. HTML GENERATORS UPDATED ---
function addIngRowHTML(container, id='', qty=1, retId='', retQty=0) {
    const div = document.createElement('div'); div.className = 'ingredient-row';
    const itemSelectHtml = renderItemSearchDropdown(id, 'ing-id');
    const retSelectHtml = renderItemSearchDropdown(retId, 'ing-ret-id');
    div.innerHTML = `${itemSelectHtml}<input type="number" class="ing-qty" value="${qty}" min="1" placeholder="${t('ph_qty')}" onchange="previewPrices()"><div class="return-arrow">➜</div>${retSelectHtml}<input type="number" class="ing-ret-qty" value="${retQty}" min="0" placeholder="${t('ph_ret')}"><button type="button" class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff;" onclick="this.parentElement.remove(); previewPrices()">X</button>`;
    container.appendChild(div);
}

function addToolRowHTML(container, id='', deg=10, qty=1) {
    const div = document.createElement('div'); div.className = 'tool-row';
    const itemSelectHtml = renderItemSearchDropdown(id, 'tool-id');
    div.innerHTML = `<div style="flex:2">${itemSelectHtml}</div><input type="number" class="tool-qty" value="${qty}" min="1" placeholder="${t('ph_qty')}" style="flex:0.5;" onchange="previewPrices()"><input type="number" class="tool-deg" value="${deg}" min="0" max="100" placeholder="${t('ph_deg')}" style="flex:1" onchange="previewPrices()"><span style="font-size:0.8em; color:var(--cor-texto-secundario);">%</span><button type="button" class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff;" onclick="this.parentElement.remove(); previewPrices()">X</button>`;
    container.appendChild(div);
}

function addIngToCard(btn) { addIngRowHTML(btn.previousElementSibling); previewPrices(); }
function addToolToCard(btn) { addToolRowHTML(btn.previousElementSibling); previewPrices(); }

function addRecipeCard(data = null) {
    const container = document.getElementById('recipesContainer');
    const card = document.createElement('div'); card.className = 'recipe-card';
    const rName = data ? data.name : t('variant_new');
    const rTime = data ? data.time : 5;
    const rLevel = data ? data.level : 0;
    const rQueue = data ? data.queue : false;
    const rTables = data ? data.tables : [];

    card.innerHTML = `<div class="recipe-header"><input type="text" class="r-name" value="${rName}" placeholder="${t('lbl_recipe_name')}" style="width:50%; font-weight:bold; background:transparent; border:none; color:var(--cor-destaque);"><div style="display:flex; gap:10px; align-items:center;"><span class="recipe-cost-badge">${t('lbl_cost')} <span class="r-calc-cost">$ 0.00</span></span><button type="button" class="btn btn-small" style="background:var(--cor-erro-borda); width:auto; border-color:var(--cor-erro); color:#fff;" onclick="this.parentElement.parentElement.parentElement.remove(); previewPrices();">X</button></div></div><div style="margin-bottom:10px;"><label style="color:var(--cor-texto-secundario); font-size:0.8em;">${t('lbl_tables')}</label>${getTablesCheckboxesHTML(rTables)}</div><div class="craft-variants"><div class="form-group"><label>${t('lbl_time')}</label><input type="number" class="r-time" value="${rTime}" min="0"></div><div class="form-group"><label>${t('lbl_level')}</label><input type="number" class="r-level" value="${rLevel}" min="0"></div><div class="form-group" style="display:flex; align-items:flex-end; padding-bottom:10px;"><label style="cursor:pointer; font-size:0.9em; color:var(--cor-texto-principal);"><input type="checkbox" class="r-queue" ${rQueue ? 'checked' : ''} style="width:auto; margin-right:5px;">${t('lbl_queue')}</label></div></div><div style="margin-bottom:5px; font-size:0.8em; text-transform:uppercase; color:var(--cor-texto-secundario); display:flex; gap:10px;"><span style="flex:2">${t('lbl_ing_header')}</span><span style="flex:0.8">${t('lbl_qty')}</span><span style="flex:0.1"></span><span style="flex:2">${t('lbl_return')}</span><span style="flex:0.8">${t('lbl_qty')}</span><span style="width:30px"></span></div><div class="r-ingredients-list"></div><button type="button" class="btn btn-secondary btn-small" onclick="addIngToCard(this)">+ ${t('lbl_ing_header')}</button><div style="margin-top:10px; border-top:1px solid var(--cor-borda-fraca); padding-top:5px;"><div style="margin-bottom:5px; font-size:0.8em; text-transform:uppercase; color:var(--cor-texto-secundario);">${t('lbl_tools_header')}</div><div class="list-header"><span style="flex:2">${t('lbl_tool_col')}</span><span style="flex:0.5">${t('lbl_qty')}</span><span style="flex:1">${t('lbl_deg_col')}</span><span style="width:30px"></span></div><div class="r-tools-list"></div><button type="button" class="btn btn-tool btn-small" onclick="addToolToCard(this)">+ ${t('col_item')}</button></div>`;
    container.appendChild(card);
    const ingListContainer = card.querySelector('.r-ingredients-list');
    if(data && data.ingredients) { data.ingredients.forEach(ing => addIngRowHTML(ingListContainer, ing.id, ing.qty, ing.returnId, ing.returnQty)); } 
    else { addIngRowHTML(ingListContainer); }
    if(data && data.tools) { const toolList = card.querySelector('.r-tools-list'); data.tools.forEach(t => addToolRowHTML(toolList, t.id, t.deg, t.qty)); }
    previewPrices();
}

// --- 5. LOGIC (Calculations) ---
function getRecipeCost(recipe, visited = []) {
    let currentRecipeCost = 0;
    if(recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
            const ingItem = items.find(i => i.id === ing.id);
            if(ingItem) currentRecipeCost += getBaseCost(ingItem, [...visited]) * ing.qty;
        });
    }
    if(recipe.tools) {
        recipe.tools.forEach(t => {
            const toolItem = items.find(i => i.id === t.id);
            if(toolItem) {
                const toolCost = getBaseCost(toolItem, [...visited]);
                currentRecipeCost += (toolCost * t.qty) * (t.deg / 100);
            }
        });
    }
    return currentRecipeCost;
}

function getBaseCost(item, visited=[]) {
    if(visited.includes(item.id)) return 0;
    visited.push(item.id);
    if(!item.isCrafted || !item.recipes || !Array.isArray(item.recipes) || item.recipes.length === 0) {
        return parseFloat(item.cost) || 0;
    }
    let minRecipeCost = Infinity;
    item.recipes.forEach(recipe => {
        let cost = getRecipeCost(recipe, visited); 
        if(cost < minRecipeCost) minRecipeCost = cost;
    });
    return minRecipeCost === Infinity ? 0 : minRecipeCost;
}

function calculatePricesFromCost(baseCost, item) {
    const cat = categories.find(c => c.id === item.cat) || {};
    const sellMult = (cat.sellMult !== null && !isNaN(cat.sellMult) && cat.sellMult !== "") ? parseFloat(cat.sellMult) : globalConfig.sellMult;
    const buyMult = (cat.buyMult !== null && !isNaN(cat.buyMult) && cat.buyMult !== "") ? parseFloat(cat.buyMult) : globalConfig.buyMult;
    const p2pMargin = (cat.p2pMargin !== null && !isNaN(cat.p2pMargin) && cat.p2pMargin !== "") ? parseFloat(cat.p2pMargin) : globalConfig.p2pMargin;
    return { base: baseCost, npcSell: baseCost * sellMult, npcBuy: baseCost * buyMult, p2p: baseCost + (baseCost * (p2pMargin / 100)) };
}
function calculatePrices(item) { const baseCost = getBaseCost(item); return calculatePricesFromCost(baseCost, item); }
function setUsageFilter(itemId) { document.getElementById('searchInput').value = `uses:${itemId}`; renderTable(); }

function previewPrices() {
    const isCrafted = document.getElementById('modal_isCrafted').checked;
    let finalCost = 0;
    if (isCrafted) {
        const recipeCards = document.querySelectorAll('.recipe-card');
        let minCost = Infinity;
        recipeCards.forEach(card => {
            let cardCost = 0;
            card.querySelectorAll('.ingredient-row').forEach(row => {
                const hiddenInput = row.querySelector('.ing-id');
                const id = hiddenInput ? hiddenInput.value : '';
                const qty = parseFloat(row.querySelector('.ing-qty').value) || 0;
                const ing = items.find(i => i.id === id);
                if(ing) cardCost += getBaseCost(ing) * qty;
            });
            card.querySelectorAll('.tool-row').forEach(row => {
                const hiddenInput = r.querySelector('.tool-id');
                const id = hiddenInput ? hiddenInput.value : '';
                const tQty = parseFloat(row.querySelector('.tool-qty').value) || 1;
                const deg = parseFloat(row.querySelector('.tool-deg').value) || 0;
                const tool = items.find(i => i.id === id);
                if(tool) cardCost += (getBaseCost(tool) * tQty) * (deg / 100);
            });
            card.querySelector('.r-calc-cost').innerText = `$ ${cardCost.toFixed(2)}`;
            if(cardCost < minCost) minCost = cardCost;
        });
        finalCost = (minCost === Infinity) ? 0 : minCost;
    } else {
        finalCost = parseFloat(document.getElementById('modal_costPrice').value) || 0;
    }
    const tempItem = { id: 'temp', cat: document.getElementById('modal_itemCategory').value, isCrafted: false, cost: finalCost };
    const prices = calculatePrices(tempItem);
    document.getElementById('modal_prevBase').innerText = `$ ${prices.base.toFixed(2)}`;
    document.getElementById('modal_prevSell').innerText = `$ ${prices.npcSell.toFixed(2)}`;
    document.getElementById('modal_prevBuy').innerText = `$ ${prices.npcBuy.toFixed(2)}`;
    document.getElementById('modal_prevP2P').innerText = `$ ${prices.p2p.toFixed(2)}`;
}

function renderTable() {
    const tbody = document.querySelector('#economyTable tbody'); tbody.innerHTML = '';
    const rawSearch = document.getElementById('searchInput').value;
    const searchTerm = normalizeText(rawSearch);
    const isUsageSearch = rawSearch.startsWith('uses:');
    const usageTargetId = isUsageSearch ? rawSearch.split(':')[1] : null;

    const filteredItems = items.filter(item => {
        if (isUsageSearch) {
            if (item.isCrafted && item.recipes) {
                for(let r of item.recipes) { if(r.ingredients && r.ingredients.some(ing => ing.id === usageTargetId)) return true; }
            } return false;
        } else {
            const normName = normalizeText(item.name); const normId = normalizeText(item.id);
            const catObj = categories.find(c => c.id === item.cat); const normCat = normalizeText(catObj ? catObj.name : item.cat);
            let tableMatch = false;
            if (item.isCrafted && item.recipes) {
                item.recipes.forEach(r => { if(r.tables) { r.tables.forEach(tid => { const tObj = craftingTables.find(t => t.id === tid); if(tObj && normalizeText(tObj.name).includes(searchTerm)) tableMatch = true; }); } });
            }
            const isCraftSearch = (searchTerm === 'craft' && item.isCrafted);
            return normName.includes(searchTerm) || normId.includes(searchTerm) || normCat.includes(searchTerm) || tableMatch || isCraftSearch || searchTerm === '';
        }
    });

    filteredItems.sort((a, b) => {
        let valA, valB;
        if (currentSort.column === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
        else if (currentSort.column === 'cat') { valA = (categories.find(c => c.id === a.cat)?.name || a.cat).toLowerCase(); valB = (categories.find(c => c.id === b.cat)?.name || b.cat).toLowerCase(); }
        else {
            const pricesA = calculatePrices(a); const pricesB = calculatePrices(b);
            const keyMap = { 'base': 'base', 'sell': 'npcSell', 'buy': 'npcBuy', 'p2p': 'p2p' };
            valA = pricesA[keyMap[currentSort.column]]; valB = pricesB[keyMap[currentSort.column]];
        }
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1; if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1; return 0;
    });

    filteredItems.forEach((item) => {
        const originalIndex = items.indexOf(item);
        let usageCount = 0;
        items.forEach(otherItem => {
            if(otherItem.isCrafted && otherItem.recipes) {
                let usesIt = false;
                otherItem.recipes.forEach(r => { if(r.ingredients && r.ingredients.some(ing => ing.id === item.id)) usesIt = true; });
                if(usesIt) usageCount++;
            }
        });
        let usageHtml = '';
        if(usageCount > 0) usageHtml = `<div class="usage-badge" onclick="setUsageFilter('${item.id}'); event.stopPropagation();"><span>↳</span> ${t('used_in_recipes', usageCount)}</div>`;

        const prices = calculatePrices(item);
        let recipeCount = (item.recipes && Array.isArray(item.recipes)) ? item.recipes.length : 0;
        let craftBadge = "";
        if(item.isCrafted) {
            if(recipeCount > 1) craftBadge = `<span style="font-size:0.7em; background:var(--cor-destaque-transparente-borda); color:var(--cor-destaque); padding:2px 4px; border-radius:2px;" title="${recipeCount} Variantes de Craft">${t('craft_badge_multi', recipeCount)}</span>`;
            else craftBadge = `<span style="font-size:0.7em; background:var(--cor-destaque-transparente-borda); color:var(--cor-destaque); padding:2px 4px; border-radius:2px;">${t('craft_badge')}</span>`;
        }

        let baseContent = `<span style="color:#ddd">$ ${prices.base.toFixed(2)}</span>`;
        let sellContent = `<span style="color:#ff8a8a">$ ${prices.npcSell.toFixed(2)}</span>`;
        let buyContent  = `<span style="color:#8aff9e">$ ${prices.npcBuy.toFixed(2)}</span>`;
        let p2pContent  = `<span style="color:var(--cor-destaque); font-weight:bold">$ ${prices.p2p.toFixed(2)}</span>`;

        if(item.isCrafted && recipeCount > 1) {
            const sortedRecipes = item.recipes.map(r => ({ ...r, calcCost: getRecipeCost(r) })).sort((a,b) => a.calcCost - b.calcCost);
            let baseList='<div class="col-variant-list">', sellList='<div class="col-variant-list col-sell">', buyList='<div class="col-variant-list col-buy">', p2pList='<div class="col-variant-list col-p2p">';
            sortedRecipes.forEach(r => {
                const rPrices = calculatePricesFromCost(r.calcCost, item);
                const rName = r.name.length > 10 ? r.name.substring(0,8)+'..' : r.name;
                baseList += `<div class="col-variant-item"><span class="col-variant-name">${rName}:</span> <span>$ ${rPrices.base.toFixed(2)}</span></div>`;
                sellList += `<div class="col-variant-item"><span class="col-variant-name">${rName}:</span> <span>$ ${rPrices.npcSell.toFixed(2)}</span></div>`;
                buyList  += `<div class="col-variant-item"><span class="col-variant-name">${rName}:</span> <span>$ ${rPrices.npcBuy.toFixed(2)}</span></div>`;
                p2pList  += `<div class="col-variant-item"><span class="col-variant-name">${rName}:</span> <span>$ ${rPrices.p2p.toFixed(2)}</span></div>`;
            });
            baseList+='</div>'; sellList+='</div>'; buyList+='</div>'; p2pList+='</div>';
            baseContent+=baseList; sellContent+=sellList; buyContent+=buyList; p2pContent+=p2pList;
        }

        const imgPath = globalConfig.imagePath || "";
        const imgName = item.imageOverride || item.id;
        const imgSrc = `${imgPath}${imgName}.png`;
        const initials = item.name.charAt(0).toUpperCase();

        const tr = document.createElement('tr'); tr.className = 'item-row';
        tr.onclick = (e) => { 
            if (!e.target.closest('button') && !e.target.closest('.usage-badge')) {
                openModal('edit', originalIndex); 
            }
        };
        tr.innerHTML = `<td><div class="item-identity"><div class="item-icon-box"><img src="${imgSrc}" class="item-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="item-icon-fallback" style="display:none;">${initials}</span></div><div><strong style="color:var(--cor-texto-principal);">${item.name}</strong> ${craftBadge}<br><small style="color:var(--cor-texto-secundario);">${item.id}</small>${usageHtml}</div></div></td><td><small style="color:var(--cor-texto-descricao);">${categories.find(c => c.id === item.cat)?.name || item.cat}</small></td><td>${baseContent}</td><td>${sellContent}</td><td>${buyContent}</td><td>${p2pContent}</td><td><div class="actions-cell"><button class="btn btn-secondary btn-small" onclick="openModal('edit', ${originalIndex})">${t('btn_edit')}</button><button class="btn btn-small" style="background:var(--cor-erro-borda); color:#fff; border-color:var(--cor-erro);" onclick="openDeleteModal('item', ${originalIndex})">X</button></div></td>`;
        tbody.appendChild(tr);
    });
}

function renderCategories() {
    const div = document.getElementById('categoryList'); div.innerHTML = '';
    categories.forEach((c, idx) => {
        const row = document.createElement('div'); row.className = 'manager-row cat-row-data'; row.dataset.id = c.id;
        // Updated button using data-tooltip for standard CSS tooltip
        row.innerHTML = `<input type="text" class="c-name" value="${c.name}" onchange="updateCategoryData(${idx}, 'name', this.value)"><input type="number" class="c-sell" value="${c.sellMult??''}" placeholder="${t('ph_global')}" step="0.1" onchange="updateCategoryData(${idx}, 'sellMult', this.value)"><input type="number" class="c-buy" value="${c.buyMult??''}" placeholder="${t('ph_global')}" step="0.1" onchange="updateCategoryData(${idx}, 'buyMult', this.value)"><input type="number" class="c-p2p" value="${c.p2pMargin??''}" placeholder="${t('ph_global')}" step="1" onchange="updateCategoryData(${idx}, 'p2pMargin', this.value)"><button class="btn btn-small btn-get" style="background:var(--cor-info); width:auto;" onclick="copyCategoryCrafts(${idx})" data-tooltip="${t('tooltip_copy_cat_crafts')}">📋</button><button class="btn btn-small" style="background:var(--cor-erro-borda); width:auto; border-color:var(--cor-erro); color:#fff;" onclick="openDeleteModal('category', ${idx})">X</button>`;
        div.appendChild(row);
    });
}

function updateCategoryData(index, field, value) {
    if(field === 'sellMult' || field === 'buyMult' || field === 'p2pMargin') {
        value = (value === "") ? null : parseFloat(value);
    }
    categories[index][field] = value;
    if(field === 'name') populateCategorySelects();
    saveLocalData();
    renderTable(); // Re-calculate prices as category multipliers might have changed
}

function renderCraftingTables() {
    const div = document.getElementById('craftingTablesList'); div.innerHTML = '';
    craftingTables.forEach((tbl, idx) => {
        const row = document.createElement('div'); row.className = 'manager-row-table table-row-data';
        // Updated button using data-tooltip for standard CSS tooltip
        row.innerHTML = `<input type="text" class="t-name" value="${tbl.name}" placeholder="${t('ph_table_name')}" onchange="updateTableData(${idx},'name',this.value)"><button class="btn btn-small btn-get" style="background:var(--cor-info); width:auto;" onclick="copyTableCrafts(${idx})" data-tooltip="${t('tooltip_copy_table_crafts')}">📋</button><button class="btn btn-small" style="background:var(--cor-erro-borda); width:auto; border-color:var(--cor-erro); color:#fff;" onclick="openDeleteModal('table', ${idx})">X</button>`;
        div.appendChild(row);
    });
}

function updateTableData(index, field, value) { 
    craftingTables[index][field] = value; 
    saveLocalData();
    renderTable(); 
}

// --- NEW MODAL INPUT LOGIC ---
function openInputModal(titleKey, labelKey, callback) {
    document.getElementById('inputModalTitle').innerText = t(titleKey);
    document.getElementById('inputModalLabel').innerText = t(labelKey);
    document.getElementById('inputModalField').value = '';
    inputModal.style.display = 'block';
    document.getElementById('inputModalField').focus();
    inputModalCallback = callback;
}
function closeInputModal() { inputModal.style.display = 'none'; inputModalCallback = null; }
function confirmInputModal() {
    const val = document.getElementById('inputModalField').value.trim();
    if(val && inputModalCallback) inputModalCallback(val);
    closeInputModal();
}

function addCraftingTable() { 
    openInputModal('title_new_table', 'lbl_table_name', (name) => {
        const id = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        craftingTables.push({ id: id, name: name }); 
        saveLocalData();
        renderCraftingTables(); 
    });
}

function addCategory() { 
    openInputModal('title_new_cat', 'name', (name) => {
        const id = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        if(categories.find(c => c.id === id)) { showToast(t('alert_id_exists')); return; }
        categories.push({id: id, name: name, sellMult:null, buyMult:null, p2pMargin:null}); 
        saveLocalData();
        renderCategories(); 
        populateCategorySelects(); 
    });
}

function populateCategorySelects() {
    const selects = document.querySelectorAll('.category-select');
    selects.forEach(sel => { const old=sel.value; sel.innerHTML='<option value="" disabled selected>Selecione...</option>'; categories.forEach(c=>{sel.innerHTML+=`<option value="${c.id}">${c.name}</option>`}); if(old) sel.value=old; });
}
function updateCalculations() {
    apiKey = document.getElementById('configApiKey').value;
    localStorage.setItem('redm_economy_apikey', apiKey); 
    globalConfig.sellMult = parseFloat(document.getElementById('globalSellMult').value);
    globalConfig.buyMult = parseFloat(document.getElementById('globalBuyMult').value);
    globalConfig.p2pMargin = parseFloat(document.getElementById('globalP2PMargin').value);
    globalConfig.imagePath = document.getElementById('globalImagePath').value;
    globalConfig.framework = document.getElementById('globalFramework').value; 
    
    updateFrameworkTexts();
    saveLocalData();
    renderTable();
}

function handleSort(column) {
    if (currentSort.column === column) { currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc'; } 
    else { currentSort.column = column; currentSort.direction = 'asc'; }
    updateSortIcons(); renderTable();
}
function updateSortIcons() {
    document.querySelectorAll('.sort-icon').forEach(el => { el.innerHTML = '⇅'; el.classList.remove('sort-active'); });
    const icon = document.getElementById(`sort-${currentSort.column}`);
    if(icon) { icon.innerHTML = currentSort.direction === 'asc' ? '▲' : '▼'; icon.classList.add('sort-active'); }
}

function openTab(tabName, btnElement) {
    const tabs = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabs.length; i++) { tabs[i].classList.remove("active"); }
    const buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) { buttons[i].classList.remove("active"); }
    
    document.getElementById("view-" + tabName).classList.add("active");
    if(btnElement) btnElement.classList.add("active");
    else if(tabName === 'items' && buttons[0]) buttons[0].classList.add("active");
}

function saveLocalData() {
    const data = {
        items: items,
        categories: categories,
        craftingTables: craftingTables,
        globalConfig: globalConfig,
        apiKey: apiKey,
        currentLang: currentLang 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadLocalData() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
        try {
            const data = JSON.parse(json);
            if(data.items) items = data.items;
            if(data.categories) categories = data.categories;
            if(data.craftingTables) craftingTables = data.craftingTables;
            if(data.globalConfig) globalConfig = data.globalConfig;
            if(data.apiKey) apiKey = data.apiKey;
            if(data.currentLang) currentLang = data.currentLang; 
            
            // Update UI inputs
            if(document.getElementById('globalSellMult')) document.getElementById('globalSellMult').value = globalConfig.sellMult;
            if(document.getElementById('globalBuyMult')) document.getElementById('globalBuyMult').value = globalConfig.buyMult;
            if(document.getElementById('globalP2PMargin')) document.getElementById('globalP2PMargin').value = globalConfig.p2pMargin;
            if(document.getElementById('globalImagePath')) document.getElementById('globalImagePath').value = globalConfig.imagePath;
            if(document.getElementById('configApiKey')) document.getElementById('configApiKey').value = apiKey;
            if(document.getElementById('langSelect')) document.getElementById('langSelect').value = currentLang; 
            if(document.getElementById('globalFramework')) document.getElementById('globalFramework').value = globalConfig.framework || 'rsg';
            
        } catch(e) { console.error("Error loading local data", e); }
    }
}

function downloadJSON() {
    saveLocalData(); 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem(STORAGE_KEY));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().slice(0,10);
    downloadAnchorNode.setAttribute("download", `RedM_Economy_Backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function uploadJSON(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.items && data.categories) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                loadLocalData();
                renderCategories();
                renderCraftingTables();
                populateCategorySelects();
                renderTable();
                updateFrameworkTexts(); 
                showToast(t('toast_restore_success'));
            } else {
                showToast(t('err_invalid_file'));
            }
        } catch(err) {
            console.error(err);
            showToast(t('err_read_file'));
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

async function callGeminiAPI(prompt) {
    if (!apiKey) { showToast(t('err_api_key')); return null; }
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) { console.error(error); showToast(t('err_ai_call')); return null; }
}

async function generateAIDescription() {
    const name = document.getElementById('modal_itemName').value;
    const catId = document.getElementById('modal_itemCategory').value;
    const catObj = categories.find(c => c.id === catId);
    const catName = catObj ? catObj.name : "Item";
    if(!name) { showToast(t('err_fill_name')); return; }
    showToast(t('toast_generating_desc'));
    const langMap = { 'pt': 'português', 'en': 'inglês', 'de': 'alemão', 'ru': 'russo' };
    const langName = langMap[currentLang] || 'português';
    const prompt = `Escreva uma descrição curta, imersiva e temática (estilo Western/Red Dead Redemption 2) para um item chamado "${name}" que pertence à categoria "${catName}". Responda APENAS com a descrição, em ${langName}.`;
    const result = await callGeminiAPI(prompt);
    if(result) { document.getElementById('modal_description').value = result.trim(); showToast(t('toast_desc_generated')); }
}

async function generateAIRecipe() {
    const name = document.getElementById('modal_itemName').value;
    const existingIds = items.map(i => i.id).join(", ");
    if(!name) { showToast(t('err_fill_name')); return; }
    showToast(t('toast_generating_recipe'));
    const prompt = `
    Você é um assistente de design para um servidor de RPG de Red Dead Redemption 2.
    Crie uma receita de crafting lógica para o item: "${name}".
    use APENAS estes IDs de itens existentes se fizer sentido: ${existingIds}.
    Retorne APENAS um JSON válido neste formato, sem markdown:
    {
        "ingredients": [{"id": "item_id", "qty": 1}],
        "tools": [{"id": "tool_id", "qty": 1, "deg": 10}],
        "time": 30,
        "level": 0
    }`;
    const result = await callGeminiAPI(prompt);
    if(result) {
        try {
            const cleanJson = result.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);
            const recipeData = {
                name: "Receita IA", time: data.time || 10, level: data.level || 0, queue: true,
                tables: [], ingredients: data.ingredients || [], tools: data.tools || []
            };
            addRecipeCard(recipeData); showToast(t('toast_recipe_added'));
        } catch(e) { console.error(e); showToast(t('err_ai_recipe')); }
    }
}

// --- NEW AI CATEGORY FUNCTIONS ---

async function generateAICategory(btn) {
    const name = document.getElementById('modal_itemName').value;
    const desc = document.getElementById('modal_description').value;
    if (!name) { showToast(t('err_fill_name')); return; }

    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "⏳";

    const catList = categories.map(c => `${c.id} (${c.name})`).join(", ");
    
    const prompt = `Given the list of categories: [${catList}]. 
    Which category best fits an item named "${name}" with description "${desc}"? 
    Return ONLY the category ID (e.g., 'raw', 'tool'). Do not add any extra text or markdown.`;

    const result = await callGeminiAPI(prompt);
    
    if (result) {
        const suggestedId = result.trim().replace(/['"`]/g, ''); // Clean potential quotes
        // Check if valid
        if (categories.some(c => c.id === suggestedId)) {
            document.getElementById('modal_itemCategory').value = suggestedId;
            previewPrices(); // Update calc if needed
            showToast(`Categoria sugerida: ${suggestedId}`);
        } else {
            showToast("IA sugeriu categoria inválida: " + suggestedId);
        }
    }

    btn.disabled = false;
    btn.innerText = originalText;
}

async function generateAutoCategoryGlobal(btn) {
    const uncategorizedItems = items.filter(i => !i.cat || i.cat === "");
    
    if (uncategorizedItems.length === 0) {
        showToast(t('toast_no_uncategorized'));
        return;
    }

    if (!confirm(`Deseja categorizar automaticamente ${uncategorizedItems.length} itens sem categoria usando IA? Isso pode levar um tempo.`)) return;

    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "⏳";
    showToast(t('toast_auto_cat_start'));

    // We process in batches to avoid huge prompts, let's say 10 items at a time
    const batchSize = 10;
    const catList = categories.map(c => c.id).join(", ");
    let processed = 0;

    for (let i = 0; i < uncategorizedItems.length; i += batchSize) {
        const batch = uncategorizedItems.slice(i, i + batchSize);
        const batchPrompt = `
        You are a RPG item categorizer.
        Categories available: [${catList}].
        Items to categorize:
        ${batch.map(item => `- ID: "${item.id}", Name: "${item.name}", Desc: "${item.description}"`).join("\n")}
        
        Return a JSON object where keys are item IDs and values are the best Category ID. 
        Example: { "apple": "consumable", "sword": "weapon" }
        Return ONLY valid JSON.
        `;

        const result = await callGeminiAPI(batchPrompt);
        
        if (result) {
            try {
                const cleanJson = result.replace(/```json|```/g, '').trim();
                const mapping = JSON.parse(cleanJson);
                
                // Apply updates
                Object.keys(mapping).forEach(itemId => {
                    const item = items.find(it => it.id === itemId);
                    const newCat = mapping[itemId];
                    if (item && categories.some(c => c.id === newCat)) {
                        item.cat = newCat;
                    }
                });
                processed += batch.length;
            } catch (e) {
                console.error("Batch error", e);
            }
        }
        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 500));
    }

    saveLocalData();
    renderTable();
    btn.disabled = false;
    btn.innerText = originalText;
    showToast(t('toast_auto_cat_success', processed));
}

// --- 9. EXPORT & RENDER FRAMEWORK FIELDS ---

function renderFrameworkFields(refreshValues = false) {
    const container = document.getElementById('frameworkFields');
    const framework = globalConfig.framework || 'rsg';
    const index = parseInt(document.getElementById('edit_index').value);
    let fData = (index !== -1 && items[index].frameworkData) ? items[index].frameworkData : {};
    
    container.innerHTML = '';

    const createCheck = (id, labelKey, checked) => `
        <div class="form-group" style="margin-bottom:0;">
            <label style="cursor:pointer; display:flex; align-items:center;">
                <input type="checkbox" id="fd_${id}" ${checked ? 'checked' : ''} style="width:auto; margin-right:5px;">
                ${t(labelKey)}
            </label>
        </div>`;
    
    const createInput = (id, labelKey, value, type="text", placeholder="") => `
        <div class="form-group" style="margin-bottom:0;">
            <label>${t(labelKey)}</label>
            <input type="${type}" id="fd_${id}" value="${value !== undefined ? value : ''}" placeholder="${placeholder}">
        </div>`;

    let html = "";

    if (framework === 'rsg') {
        html += createInput('weight', 'lbl_weight', fData.weight || 0, 'number');
        html += createInput('type', 'lbl_type', fData.type || 'item');
        html += createCheck('unique', 'lbl_unique', fData.unique);
        html += createCheck('useable', 'lbl_usable', fData.useable !== false);
        // Corrected decay to be an input (can be false or number)
        html += createInput('decay', 'lbl_decay', fData.decay !== undefined ? fData.decay : '', 'number', '0 = false');
        html += createCheck('delete', 'lbl_delete', fData.delete);
        html += createCheck('shouldClose', 'lbl_should_close', fData.shouldClose);
    } else if (framework === 'vorp') {
        html += createInput('limit', 'lbl_limit', fData.limit || 10, 'number');
        html += createInput('weight', 'lbl_weight', fData.weight || 0, 'number'); 
        html += createInput('type', 'lbl_type', fData.type || 'item_standard');
        html += createCheck('usable', 'lbl_usable', fData.usable !== false); 
        html += createCheck('can_remove', 'lbl_can_remove', fData.can_remove !== false);
        html += createInput('degradation', 'lbl_degradation', fData.degradation || 0, 'number');
        html += createInput('groupId', 'lbl_group_id', fData.groupId || 1, 'number');
        html += createInput('dbId', 'lbl_db_id', fData.dbId, 'number', 'Auto/Random');
    }

    container.innerHTML = html;
}

function getFrameworkDataFromInputs() {
    const framework = globalConfig.framework || 'rsg';
    let data = {};
    const getVal = (id, type) => {
        const el = document.getElementById('fd_' + id);
        if(!el) return null;
        if(type === 'bool') return el.checked;
        if(type === 'num') return parseFloat(el.value) || 0;
        return el.value;
    };

    if (framework === 'rsg') {
        data.weight = getVal('weight', 'num');
        data.type = getVal('type', 'text');
        data.unique = getVal('unique', 'bool');
        data.useable = getVal('useable', 'bool');
        // Capture decay as number (0 if empty/0)
        data.decay = getVal('decay', 'num');
        data.delete = getVal('delete', 'bool');
        data.shouldClose = getVal('shouldClose', 'bool');
    } else {
        data.limit = getVal('limit', 'num');
        data.weight = getVal('weight', 'num');
        data.type = getVal('type', 'text');
        data.usable = getVal('usable', 'bool');
        data.can_remove = getVal('can_remove', 'bool');
        data.degradation = getVal('degradation', 'num');
        data.groupId = getVal('groupId', 'num');
        data.dbId = getVal('dbId', 'num'); 
    }
    return data;
}

function exportItemDefinition() {
    const itemId = document.getElementById('modal_itemId').value.trim();
    // Raw values
    const rawName = document.getElementById('modal_itemName').value;
    const rawDesc = document.getElementById('modal_description').value;
    const imgName = document.getElementById('modal_imageOverride').value || itemId;
    
    // Get current data from inputs, not saved data
    const fData = getFrameworkDataFromInputs();
    const framework = globalConfig.framework || 'rsg';
    
    let output = "";

    if (framework === 'rsg') {
        // Safe string escaping for Lua (escape backslashes then double quotes)
        const escapeLua = (str) => (str || "").replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const itemName = escapeLua(rawName);
        const desc = escapeLua(rawDesc);
        // RSG: Check decay value: if 0 or false -> 'false', else number
        const decayVal = (fData.decay && fData.decay > 0) ? fData.decay : 'false';
        output = `${itemId} = { name = "${itemId}", label = "${itemName}", weight = ${fData.weight}, type = "${fData.type}", image = "${imgName}.png", unique = ${fData.unique}, useable = ${fData.useable}, decay = ${decayVal}, delete = ${fData.delete}, shouldClose = ${fData.shouldClose}, description = "${desc}" },`;
    } else {
        // VORP: SQL Insert
        // INSERT INTO `items` (`item`, `label`, `limit`, `can_remove`, `type`, `usable`, `id`, `groupId`, `metadata`, `desc`, `degradation`, `weight`) VALUES ...
        const itemName = rawName.replace(/'/g, "\\'");
        const desc = rawDesc.replace(/'/g, "\\'");
        const dbId = fData.dbId || Math.floor(Math.random() * 10000); // Random if empty for SQL generation purpose
        output = `INSERT INTO \`items\` (\`item\`, \`label\`, \`limit\`, \`can_remove\`, \`type\`, \`usable\`, \`id\`, \`groupId\`, \`metadata\`, \`desc\`, \`degradation\`, \`weight\`) VALUES ('${itemId}', '${itemName}', ${fData.limit}, ${fData.can_remove?1:0}, '${fData.type}', ${fData.usable?1:0}, ${dbId}, ${fData.groupId}, '{}', '${desc}', ${fData.degradation}, ${fData.weight});`;
    }

    const textArea = document.createElement("textarea");
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast(t('alert_copied'));
}

function exportAllItemsDefinitions() {
    const framework = globalConfig.framework || 'rsg';
    let output = "";
    
    if (items.length === 0) {
        showToast(t('toast_no_export'));
        return;
    }

    if (framework === 'rsg') {
        output = "RSGShared = RSGShared or {}\nRSGShared.Items = {\n";
        // Safe string escaping for Lua (escape backslashes then double quotes)
        const escapeLua = (str) => (str || "").replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        items.forEach(item => {
            const fData = item.frameworkData || {};
            // Defaults
            const weight = fData.weight || 0;
            const type = fData.type || 'item';
            const unique = fData.unique || false;
            const useable = fData.useable !== false; // default true
            const shouldClose = fData.shouldClose || false;
            const del = fData.delete || false;
            const decay = (fData.decay && fData.decay > 0) ? fData.decay : 'false';
            const desc = escapeLua(item.description);
            const label = escapeLua(item.name);
            const img = (item.imageOverride || item.id) + ".png";
            
            output += `    ['${item.id}'] = { name = "${item.id}", label = "${label}", weight = ${weight}, type = "${type}", image = "${img}", unique = ${unique}, useable = ${useable}, decay = ${decay}, delete = ${del}, shouldClose = ${shouldClose}, description = "${desc}" },\n`;
        });
        output += "}";
    } else {
        // VORP
        output = "INSERT INTO `items` (`item`, `label`, `limit`, `can_remove`, `type`, `usable`, `id`, `groupId`, `metadata`, `desc`, `degradation`, `weight`) VALUES \n";
        const values = [];
        items.forEach(item => {
            const fData = item.frameworkData || {};
            // Defaults
            const limit = fData.limit || 10;
            const canRemove = fData.can_remove !== false ? 1 : 0;
            const type = fData.type || 'item_standard';
            const usable = fData.usable !== false ? 1 : 0;
            const dbId = fData.dbId || Math.floor(Math.random() * 100000); // Random ID if missing
            const groupId = fData.groupId || 1;
            const deg = fData.degradation || 0;
            const weight = fData.weight || 0;
            const desc = (item.description || "").replace(/'/g, "\\'");
            
            values.push(`    ('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${limit}, ${canRemove}, '${type}', ${usable}, ${dbId}, ${groupId}, '{}', '${desc}', ${deg}, ${weight})`);
        });
        output += values.join(",\n") + ";";
    }

    const textArea = document.createElement("textarea");
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast(t('toast_copied_clipboard', items.length));
}

function copyAllCraftsDefinitions() {
    let fullLua = "Config.CraftingRecipes = {\n";
    let count = 0;

    items.forEach(item => {
        if (!item.isCrafted || !item.recipes || item.recipes.length === 0) return;

        const catObj = categories.find(c => c.id === item.cat);
        const categoryName = catObj ? catObj.name : item.cat;
        // Safe string escaping for Lua (escape backslashes then double quotes)
        const description = (item.description || "").replace(/\\/g, '\\\\').replace(/"/g, '\\"');

        item.recipes.forEach(recipe => {
            const rName = recipe.name;
            // logic for key generation
            let keyName = item.id;
            if (item.recipes.length > 1) {
                const safeName = rName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                keyName = `${item.id}_${safeName}`;
            }

            let ingStr = "";
            if (recipe.ingredients) {
                recipe.ingredients.forEach(ing => {
                    if (ing.id) {
                        ingStr += `\n            { item = "${ing.id}", amount = ${ing.qty}`;
                        if (ing.returnId && ing.returnQty > 0) {
                            ingStr += `, returnItem = { item = "${ing.returnId}", amount = ${ing.returnQty} }`;
                        }
                        ingStr += ` },`;
                    }
                });
            }

            let toolStr = "";
            if (recipe.tools) {
                recipe.tools.forEach(t => {
                    if (t.id) {
                        const deg = t.deg || 0;
                        const qty = t.qty || 1;
                        toolStr += `\n            { item = "${t.id}", amount = ${qty}, degradation = ${deg} },`;
                    }
                });
            }

            fullLua += `    ['${keyName}'] = { -- ${item.name} (${rName})
    craftItem = "${item.id}",
    amount = 1,
    time = ${recipe.time || 0},
    description = "${description}",
    category = "${categoryName}",
    lvlNeed = ${recipe.level || 0},
    productionQueue = ${recipe.queue},
    required_items = {${ingStr}
    },
    required_tools = {${toolStr}
    },
},\n`;
            count++;
        });
    });

    fullLua += "}";

    if (count === 0) {
        showToast(t('toast_no_export'));
        return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = fullLua;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast(t('toast_copied_clipboard', count));
}

function openImportModal() { importModal.style.display = "block"; }
function closeImportModal() { importModal.style.display = "none"; document.getElementById('importContent').value = ''; }
function processImport() {
    const type = document.getElementById('importType').value;
    const content = document.getElementById('importContent').value;
    let importedCount = 0; let skippedCount = 0;
    
    if (type === 'rsg') {
        const regex = /(\w+)\s*=\s*\{([^}]+)\}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1]; const body = match[2];
            // Improved regex for name/label/desc to handle escaped quotes inside
            const nameMatch = body.match(/name\s*=\s*(['"])((?:\\\1|.)*?)\1/);
            const labelMatch = body.match(/label\s*=\s*(['"])((?:\\\1|.)*?)\1/);
            const descMatch = body.match(/description\s*=\s*(['"])((?:\\\1|[\s\S])*?)\1/);
            const imgMatch = body.match(/image\s*=\s*(['"])((?:\\\1|.)*?)\1/);
            
            // Extract RSG specific fields
            const weightMatch = body.match(/weight\s*=\s*(\d+)/);
            const typeMatch = body.match(/type\s*=\s*(['"])((?:\\\1|.)*?)\1/);
            const uniqueMatch = body.match(/unique\s*=\s*(true|false)/);
            const useableMatch = body.match(/useable\s*=\s*(true|false)/);
            const shouldCloseMatch = body.match(/shouldClose\s*=\s*(true|false)/);
            const deleteMatch = body.match(/delete\s*=\s*(true|false)/);
            // Decay can be false or number
            const decayMatch = body.match(/decay\s*=\s*([a-zA-Z0-9\.]+)/); 

            const id = nameMatch ? nameMatch[2] : key; 
            if (items.find(i => i.id === id)) { skippedCount++; continue; }
            
            let decayVal = 0;
            if(decayMatch && decayMatch[1] !== 'false') {
                decayVal = parseFloat(decayMatch[1]) || 0;
            }

            const fData = {
                weight: weightMatch ? parseInt(weightMatch[1]) : 0,
                type: typeMatch ? typeMatch[2] : 'item',
                unique: uniqueMatch ? uniqueMatch[1] === 'true' : false,
                useable: useableMatch ? useableMatch[1] === 'true' : false,
                shouldClose: shouldCloseMatch ? shouldCloseMatch[1] === 'true' : false,
                delete: deleteMatch ? deleteMatch[1] === 'true' : false,
                decay: decayVal
            };

            items.push({ 
                id: id, 
                name: labelMatch ? labelMatch[2].replace(/\\(['"])/g, '$1') : id, 
                cat: '', 
                description: descMatch ? descMatch[2].replace(/\\(['"])/g, '$1') : '', 
                imageOverride: imgMatch ? imgMatch[2].replace('.png','').replace(/\\(['"])/g, '$1') : '', 
                isCrafted: false, 
                cost: 0, 
                recipes: [], 
                frameworkData: fData 
            });
            importedCount++;
        }
    } else if (type === 'vorp') {
        let cleanContent = content.replace(/INSERT\s+INTO.*VALUES\s*/i, '').trim();
        if(cleanContent.endsWith(';')) cleanContent = cleanContent.slice(0, -1);
        
        // Need to identify column order if possible, but regex based on example for now.
        // Simplified SQL parser based on VALUES list assuming standard order from example
        // `item`, `label`, `limit`, `can_remove`, `type`, `usable`, `id`, `groupId`, `metadata`, `desc`, `degradation`, `weight`
        
        const rows = cleanContent.split(/\),\s*\(/);
        rows.forEach(row => {
            let cleanRow = row.replace(/^\(/, '').replace(/\)$/, '');
            // Matches 'string' or number
            const parts = cleanRow.match(/(".*?"|'.*?'|[^",\s]+)(?=\s*,|\s*$)/g);
            
            if(parts && parts.length >= 2) {
                const id = parts[0].replace(/'/g, "").replace(/"/g, ""); 
                const label = parts[1].replace(/'/g, "").replace(/"/g, "");
                
                // Assuming example structure:
                // 0:item, 1:label, 2:limit, 3:can_remove, 4:type, 5:usable, 6:id, 7:groupId, 8:meta, 9:desc, 10:deg, 11:weight
                
                const limit = parts[2] ? parseInt(parts[2]) : 10;
                const canRemove = parts[3] ? parts[3] == '1' : true;
                const iType = parts[4] ? parts[4].replace(/'/g, "") : 'item_standard';
                const usable = parts[5] ? parts[5] == '1' : true;
                const dbId = parts[6] ? parseInt(parts[6]) : 0;
                const groupId = parts[7] ? parseInt(parts[7]) : 0;
                let desc = ""; 
                if(parts[9]) desc = parts[9].replace(/'/g, "");
                const deg = parts[10] ? parseFloat(parts[10]) : 0;
                const weight = parts[11] ? parseFloat(parts[11]) : 0;

                if (items.find(i => i.id === id)) { skippedCount++; return; }
                
                const fData = {
                    limit: limit, can_remove: canRemove, type: iType, usable: usable,
                    dbId: dbId, groupId: groupId, degradation: deg, weight: weight
                };

                items.push({ 
                    id: id, name: label, cat: '', description: desc, 
                    imageOverride: '', isCrafted: false, cost: 0, recipes: [], 
                    frameworkData: fData 
                });
                importedCount++;
            }
        });
    }
    saveLocalData();
    renderTable(); closeImportModal(); showToast(t('import_success', importedCount, skippedCount));
}

function copyCategoryCrafts(index) {
    const catId = categories[index].id; let keys = [];
    items.forEach(item => {
        if (item.cat === catId && item.isCrafted) {
            if (item.recipes && item.recipes.length > 1) {
                item.recipes.forEach(recipe => { const safeName = recipe.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); keys.push(`${item.id}_${safeName}`); });
            } else if (item.recipes && item.recipes.length === 1) { keys.push(item.id); }
        }
    });
    copyKeysToClipboard(keys);
}

function copyTableCrafts(index) {
    const tableId = craftingTables[index].id; let keys = [];
    items.forEach(item => {
        if (item.isCrafted && item.recipes) {
            item.recipes.forEach(recipe => {
                if (recipe.tables && recipe.tables.includes(tableId)) {
                    if (item.recipes.length > 1) { const safeName = recipe.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(); keys.push(`${item.id}_${safeName}`); } 
                    else { keys.push(item.id); }
                }
            });
        }
    });
    copyKeysToClipboard(keys);
}

function copyKeysToClipboard(keys) {
    if (!keys || keys.length === 0) { showToast(t('toast_no_export')); return; }
    const formatted = `{'${keys.join("', '")}'}`;
    const textArea = document.createElement("textarea"); textArea.value = formatted; document.body.appendChild(textArea); textArea.select(); document.execCommand("copy"); document.body.removeChild(textArea);
    showToast(t('alert_copied'));
}

function exportLua() {
    const itemId = document.getElementById('modal_itemId').value.trim();
    const itemName = document.getElementById('modal_itemName').value;
    const catId = document.getElementById('modal_itemCategory').value;
    const catObj = categories.find(c => c.id === catId);
    const categoryName = catObj ? catObj.name : catId;
    const description = document.getElementById('modal_description').value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    if (!document.getElementById('modal_isCrafted').checked) {
        alert(t('alert_not_craftable'));
        return;
    }

    const recipeCards = document.querySelectorAll('.recipe-card');
    if (recipeCards.length === 0) {
        alert(t('alert_add_variant'));
        return;
    }

    let luaOutput = "";

    recipeCards.forEach((card, index) => {
        const rName = card.querySelector('.r-name').value.trim();
        const rTime = parseInt(card.querySelector('.r-time').value) || 0;
        const rLevel = parseInt(card.querySelector('.r-level').value) || 0;
        const rQueue = card.querySelector('.r-queue').checked;
        
        let keyName = itemId;
        if (recipeCards.length > 1) {
            const safeName = rName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            keyName = `${itemId}_${safeName}`;
        }

        let ingStr = "";
        card.querySelectorAll('.ingredient-row').forEach(r => {
            // Updated to get value from hidden input since selectors changed
            const hiddenInput = r.querySelector('.ing-id');
            const id = hiddenInput ? hiddenInput.value : '';
            const qty = r.querySelector('.ing-qty').value;
            const retHidden = r.querySelector('.ing-ret-id');
            const retId = retHidden ? retHidden.value : '';
            const retQty = r.querySelector('.ing-ret-qty').value;

            if(id) {
                ingStr += `\n            { item = "${id}", amount = ${qty}`;
                if(retId && retQty > 0) {
                    ingStr += `, returnItem = { item = "${retId}", amount = ${retQty} }`;
                }
                ingStr += ` },`;
            }
        });

        let toolStr = "";
        card.querySelectorAll('.tool-row').forEach(r => {
            const hiddenInput = r.querySelector('.tool-id');
            const id = hiddenInput ? hiddenInput.value : '';
            const qty = r.querySelector('.tool-qty').value || 1;
            const deg = r.querySelector('.tool-deg').value || 0;
            if(id) {
                toolStr += `\n            { item = "${id}", amount = ${qty}, degradation = ${deg} },`;
            }
        });

        luaOutput += `    ['${keyName}'] = { -- ${itemName} (${rName})
    craftItem = "${itemId}",
    amount = 1,
    time = ${rTime},
    description = "${description}",
    category = "${categoryName}",
    lvlNeed = ${rLevel},
    productionQueue = ${rQueue},
    required_items = {${ingStr}
    },
    required_tools = {${toolStr}
    },
},\n`;
    });

    const textArea = document.createElement("textarea");
    textArea.value = luaOutput;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast(t('alert_copied'));
}

// --- 7. MODAL & DELETION FUNCTIONS ---
function openModal(mode, index = -1) {
    const form = document.getElementById('itemForm');
    form.reset();
    document.getElementById('recipesContainer').innerHTML = '';
    document.getElementById('edit_index').value = index;
    
    if (mode === 'create') {
        document.getElementById('modalTitle').innerText = t('modal_manage_title'); 
        document.getElementById('modal_itemId').disabled = false;
        document.getElementById('modal_itemId').value = '';
        toggleCraftMode(); 
    } else if (mode === 'edit') {
        const item = items[index];
        document.getElementById('modalTitle').innerText = t('modal_manage_title') + ': ' + item.name;
        document.getElementById('modal_itemId').value = item.id;
        document.getElementById('modal_itemId').disabled = true;
        document.getElementById('modal_itemName').value = item.name;
        document.getElementById('modal_itemCategory').value = item.cat;
        document.getElementById('modal_description').value = item.description || "";
        document.getElementById('modal_imageOverride').value = item.imageOverride || "";
        document.getElementById('modal_isCrafted').checked = item.isCrafted;
        
        const isCrafted = item.isCrafted;
        document.getElementById('modal_craftingSection').style.display = isCrafted ? 'block' : 'none';
        document.getElementById('modal_costPrice').disabled = isCrafted;
        
        if (isCrafted) {
            document.getElementById('modal_costPrice').value = '';
            document.getElementById('modal_costPrice').placeholder = t('ph_auto');
            if (item.recipes && item.recipes.length > 0) {
                item.recipes.forEach(recipe => addRecipeCard(recipe));
            } else {
                addRecipeCard();
            }
        } else {
            document.getElementById('modal_costPrice').value = item.cost;
            document.getElementById('modal_costPrice').placeholder = '0.00';
        }
    }
    
    renderFrameworkFields();
    previewPrices();
    modal.style.display = "block";
}

function closeModal() { modal.style.display = "none"; }

function openDeleteModal(type, index) { 
    itemToDeleteIndex = index; 
    deleteTargetType = type;
    let name = "";
    let msg = "";

    if(type === 'item') {
        name = items[index].name;
        msg = t('delete_msg_item');
    } else if(type === 'category') {
        name = categories[index].name;
        msg = t('delete_msg_cat');
    } else if(type === 'table') {
        name = craftingTables[index].name;
        msg = t('delete_msg_table');
    }

    document.getElementById('deleteItemName').innerText = name; 
    document.getElementById('deleteMsg').innerText = msg;
    deleteModal.style.display = "block"; 
}

function closeDeleteModal() { deleteModal.style.display = "none"; itemToDeleteIndex = -1; deleteTargetType = null; }

function confirmDelete() { 
    if (itemToDeleteIndex > -1) { 
        if (deleteTargetType === 'item') {
            items.splice(itemToDeleteIndex, 1); 
            renderTable();
        } else if (deleteTargetType === 'category') {
            categories.splice(itemToDeleteIndex, 1);
            renderCategories();
            populateCategorySelects();
            updateCalculations();
        } else if (deleteTargetType === 'table') {
            craftingTables.splice(itemToDeleteIndex, 1);
            renderCraftingTables();
        }
        saveLocalData();
    } 
    closeDeleteModal(); 
}

function toggleCraftMode() {
    const isCrafted = document.getElementById('modal_isCrafted').checked;
    document.getElementById('modal_craftingSection').style.display = isCrafted ? 'block' : 'none';
    document.getElementById('modal_costPrice').disabled = isCrafted;
    if(isCrafted && document.getElementById('recipesContainer').children.length === 0) { 
        if (typeof addRecipeCard === "function") {
            addRecipeCard(); 
        }
    }
    if(isCrafted) { document.getElementById('modal_costPrice').value = ''; document.getElementById('modal_costPrice').placeholder = t('ph_auto'); } 
    else { document.getElementById('modal_costPrice').placeholder = '0.00'; }
    previewPrices();
}

document.getElementById('itemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('edit_index').value);
    const itemId = document.getElementById('modal_itemId').value;
    if (index === -1 && items.find(i => i.id === itemId)) { alert(t('alert_id_exists')); return; }
    
    const isCrafted = document.getElementById('modal_isCrafted').checked;
    let recipes = [];
    if(isCrafted) {
        document.querySelectorAll('.recipe-card').forEach(card => {
            let ingredients = [], tools = [], tables = [];
            card.querySelectorAll('.table-checkbox:checked').forEach(cb => tables.push(cb.value));
            card.querySelectorAll('.ingredient-row').forEach(r => {
                const hiddenInput = r.querySelector('.ing-id');
                const retHidden = r.querySelector('.ing-ret-id');
                ingredients.push({ 
                    id: hiddenInput ? hiddenInput.value : '', 
                    qty: parseFloat(r.querySelector('.ing-qty').value), 
                    returnId: retHidden ? retHidden.value : '', 
                    returnQty: parseFloat(r.querySelector('.ing-ret-qty').value) || 0 
                });
            });
            card.querySelectorAll('.tool-row').forEach(r => {
                const hiddenInput = r.querySelector('.tool-id');
                tools.push({ 
                    id: hiddenInput ? hiddenInput.value : '', 
                    qty: parseFloat(r.querySelector('.tool-qty').value)||1, 
                    deg: parseFloat(r.querySelector('.tool-deg').value) 
                });
            });
            recipes.push({
                name: card.querySelector('.r-name').value || "Variante", time: parseInt(card.querySelector('.r-time').value) || 0, level: parseInt(card.querySelector('.r-level').value) || 0,
                queue: card.querySelector('.r-queue').checked, tables: tables, ingredients: ingredients, tools: tools
            });
        });
    }
    
    const frameworkData = getFrameworkDataFromInputs();

    const itemData = {
        id: itemId, name: document.getElementById('modal_itemName').value, cat: document.getElementById('modal_itemCategory').value,
        description: document.getElementById('modal_description').value, imageOverride: document.getElementById('modal_imageOverride').value,
        isCrafted: isCrafted, cost: parseFloat(document.getElementById('modal_costPrice').value) || 0, recipes: recipes,
        frameworkData: frameworkData 
    };
    if (index === -1) items.push(itemData); else items[index] = itemData;
    saveLocalData();
    closeModal(); renderTable();
});

// --- 8. INITIALIZATION ---
window.onload = function() {
    modal = document.getElementById("itemModal");
    deleteModal = document.getElementById("deleteModal");
    importModal = document.getElementById("importModal");
    inputModal = document.getElementById("inputModal");
    
    loadLocalData(); 
    
    renderCategories();
    renderCraftingTables();
    populateCategorySelects();
    renderTable();
    
    setLanguage(currentLang); 
    apiKey = localStorage.getItem('redm_economy_apikey') || "";
    if(document.getElementById('configApiKey')) document.getElementById('configApiKey').value = apiKey;
};

function clearAllItems() {
    if (confirm(t('confirm_clear_all'))) {
        items = [];
        saveLocalData();
        renderTable();
        showToast(t('toast_cleared'));
    }
}

window.onclick = function(event) { 
    if (modal && event.target == modal) closeModal(); 
    if (deleteModal && event.target == deleteModal) closeDeleteModal();
    if (importModal && event.target == importModal) closeImportModal();
    if (inputModal && event.target == inputModal) closeInputModal();
}