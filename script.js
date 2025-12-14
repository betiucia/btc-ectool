let apiKey = ""; 
const STORAGE_KEY = 'btc_ectool';

// --- 1. GLOBAL VARIABLES & DATA ---
let currentLang = 'en'; 
let globalConfig = { sellMult: 2.0, buyMult: 0.5, p2pMargin: 30, imagePath: "", framework: 'rsg' };

// Data Arrays
let categories = [];
let craftingTables = [];
let items = [];
let jobTiers = [
    { id: 'tier_early', name: 'Early Game' },
    { id: 'tier_mid', name: 'Mid Game' },
    { id: 'tier_late', name: 'Late Game' }
];
let jobs = []; 
let assetCategories = [
    { id: 'cat_properties', nameKey: 'cat_properties' },
    { id: 'cat_vehicles', nameKey: 'cat_vehicles' },
    { id: 'cat_animals', nameKey: 'cat_animals' }
];
let assets = [];

let currentSort = { column: 'name', direction: 'asc' };

// Global DOM Elements
let modal, deleteModal, importModal, inputModal, jobModal, assetModal;
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
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.placeholder = t('search_placeholder');
    
    // Update default tiers text
    if(jobTiers.length === 3 && jobTiers[0].id === 'tier_early') {
        jobTiers[0].name = t('tier_early'); jobTiers[1].name = t('tier_mid'); jobTiers[2].name = t('tier_late');
    }

    saveLocalData(); 
    
    // Refresh all views
    if(typeof renderTable === 'function') renderTable(); 
    if(typeof renderCategories === 'function') renderCategories();
    if(typeof renderCraftingTables === 'function') renderCraftingTables();
    if(typeof renderJobKanban === 'function') renderJobKanban();
    if(typeof renderAssetBoard === 'function') renderAssetBoard();
}

function updateFrameworkTexts() {
    const frameName = globalConfig.framework ? globalConfig.framework.toUpperCase() : 'RSG';
    const header = document.getElementById('frameworkHeader');
    if(header) header.innerText = t('header_framework_data', frameName);
    const btnExport = document.getElementById('btnExportDef');
    if(btnExport) btnExport.innerText = t('btn_export_item_def', frameName);
    
    // Check if function exists (in script_item.js)
    if(typeof renderFrameworkFields === 'function') renderFrameworkFields(true); 
}

function normalizeText(text) { return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ""; }

function showToast(message, isError = false) {
    let toast = document.getElementById("toast");
    if (!toast) { toast = document.createElement("div"); toast.id = "toast"; toast.className = "toast"; document.body.appendChild(toast); }
    toast.innerText = message; 
    if(isError) toast.style.backgroundColor = "var(--cor-erro)";
    else toast.style.backgroundColor = "var(--cor-destaque)";
    
    toast.classList.add("show"); 
    setTimeout(function(){ 
        toast.classList.remove("show"); 
        setTimeout(() => toast.style.backgroundColor = "", 300);
    }, 3000);
}

// --- 3. GLOBAL DROPDOWN SEARCH LOGIC ---
function renderItemSearchDropdown(selectedId, className, onChangeStr = "previewPrices()") {
    let selectedName = "";
    let itemsHtml = "";
    items.forEach(i => {
        if(i.id === selectedId) selectedName = i.name;
        const safeName = i.name.replace(/'/g, "\\'");
        itemsHtml += `<div class="ds-item" onclick="selectItem(this, '${i.id}', '${safeName}', '${onChangeStr}')">${i.name} <small>${i.id}</small></div>`;
    });
    return `
    <div class="dropdown-search">
        <input type="text" class="ds-display" placeholder="${t('opt_select')}" value="${selectedName}" onfocus="toggleDropdown(this, true)" oninput="filterDropdown(this)">
        <input type="hidden" class="ds-value ${className}" value="${selectedId}" onchange="${onChangeStr}"> 
        <div class="ds-list">${itemsHtml}</div>
    </div>`;
}

function renderCategorySearchDropdown(selectedId) {
    let selectedName = "";
    let itemsHtml = "";
    const sortedCats = [...categories].sort((a,b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
    });
    sortedCats.forEach(c => {
        if(c.id === selectedId) selectedName = c.name;
        const safeName = (c.name || "").replace(/'/g, "\\'");
        itemsHtml += `<div class="ds-item" onclick="selectItem(this, '${c.id}', '${safeName}', 'previewPrices()')">${c.name} <small>${c.id}</small></div>`;
    });
    return `
    <div class="dropdown-search">
        <input type="text" class="ds-display" id="cat_display_input" placeholder="${t('opt_select')}" value="${selectedName}" onfocus="toggleDropdown(this, true)" oninput="filterDropdown(this)">
        <input type="hidden" class="ds-value" id="modal_itemCategory" value="${selectedId}" onchange="previewPrices()"> 
        <div class="ds-list" style="z-index: 1100;"> 
            ${itemsHtml}
        </div>
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

function selectItem(div, id, name, onChangeFuncStr) {
    const container = div.parentElement.parentElement;
    const display = container.querySelector('.ds-display');
    const hidden = container.querySelector('.ds-value');
    display.value = name;
    hidden.value = id;
    
    if(onChangeFuncStr) {
        try {
            // Executing global functions safely
            if(window[onChangeFuncStr.replace('()','')]) {
                window[onChangeFuncStr.replace('()','')]();
            } else if (onChangeFuncStr.includes('calculateJobGains') && typeof calculateJobGains === 'function') {
                calculateJobGains();
            } else if (onChangeFuncStr.includes('previewPrices') && typeof previewPrices === 'function') {
                previewPrices();
            }
        } catch(e) { console.log("Dropdown onChange error"); }
    }
    div.parentElement.style.display = 'none';
}

window.addEventListener('click', function(e) {
    if (!e.target.matches('.ds-display')) {
        document.querySelectorAll('.ds-list').forEach(l => l.style.display = 'none');
    }
});

// --- 4. GLOBAL CONFIG & CALCS ---
function updateCalculations() {
    const apiKeyEl = document.getElementById('configApiKey');
    if(apiKeyEl) apiKey = apiKeyEl.value;
    
    localStorage.setItem('redm_economy_apikey', apiKey); 
    globalConfig.sellMult = parseFloat(document.getElementById('globalSellMult').value);
    globalConfig.buyMult = parseFloat(document.getElementById('globalBuyMult').value);
    globalConfig.p2pMargin = parseFloat(document.getElementById('globalP2PMargin').value);
    globalConfig.imagePath = document.getElementById('globalImagePath').value;
    globalConfig.framework = document.getElementById('globalFramework').value; 
    
    updateFrameworkTexts();
    saveLocalData();
    
    if(typeof renderTable === 'function') renderTable();
    if(typeof calculateJobGains === 'function') calculateJobGains();
    if(typeof renderAssetBoard === 'function') renderAssetBoard();
}

function openTab(tabName, btnElement) {
    const tabs = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabs.length; i++) { tabs[i].classList.remove("active"); }
    const buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) { buttons[i].classList.remove("active"); }
    
    document.getElementById("view-" + tabName).classList.add("active");
    if(btnElement) btnElement.classList.add("active");
    else if(tabName === 'items' && buttons[0]) buttons[0].classList.add("active");

    if(tabName === 'jobs' && typeof renderJobKanban === 'function') renderJobKanban();
    if(tabName === 'assets' && typeof renderAssetBoard === 'function') renderAssetBoard();
}

// --- 5. PERSISTENCE ---
function saveLocalData() {
    const data = {
        items: items,
        categories: categories,
        craftingTables: craftingTables,
        globalConfig: globalConfig,
        apiKey: apiKey,
        currentLang: currentLang,
        jobTiers: jobTiers,
        jobs: jobs,
        assetCategories: assetCategories,
        assets: assets
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        showToast("⚠️ Storage Limit Reached! Cannot save.", true);
        console.error("Save Error", e);
    }
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
            
            if(data.jobTiers) jobTiers = data.jobTiers;
            if(data.jobs) jobs = data.jobs;

            if(data.assetCategories) assetCategories = data.assetCategories;
            if(data.assets) assets = data.assets;

            // UI Updates
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
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    loadLocalData();
                    // Call render functions if modules are loaded
                    if(typeof renderCategories === 'function') renderCategories();
                    if(typeof renderCraftingTables === 'function') renderCraftingTables();
                    if(typeof renderTable === 'function') renderTable();
                    updateFrameworkTexts();
                    if(typeof renderJobKanban === 'function') renderJobKanban();
                    if(typeof renderAssetBoard === 'function') renderAssetBoard();
                    showToast(t('toast_restore_success'));
                } catch(e) {
                    showToast("Backup too large.", true);
                }
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

// --- SHARED HELPER FOR CLIPBOARD ---
function copyKeysToClipboard(keys, isRawContent=false) {
    if (!keys || keys.length === 0) { showToast(t('toast_no_export'), true); return; }
    const formatted = isRawContent ? keys[0] : `{'${keys.join("', '")}'}`;
    const textArea = document.createElement("textarea"); textArea.value = formatted; document.body.appendChild(textArea); textArea.select(); document.execCommand("copy"); document.body.removeChild(textArea);
    showToast(t('alert_copied'));
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

// --- 6. GLOBAL DELETE LOGIC ---
function openDeleteModal(type, index) { 
    itemToDeleteIndex = index; deleteTargetType = type;
    let name = ""; let msg = "";
    
    if(type === 'item') { name = items[index].name; msg = t('delete_msg_item'); } 
    else if(type === 'category') { name = categories[index].name; msg = t('delete_msg_cat'); } 
    else if(type === 'table') { name = craftingTables[index].name; msg = t('delete_msg_table'); }
    else if(type === 'tier') { name = jobTiers[index].name; msg = t('delete_msg_tier'); }
    else if(type === 'job') { const job = jobs.find(j => j.id === index); name = job ? job.name : ''; msg = t('delete_msg_job'); } 
    else if(type === 'asset') { const asset = assets.find(a => a.id === index); name = asset ? asset.name : ''; msg = t('delete_msg_asset'); }
    else if(type === 'asset_cat') { const cat = assetCategories[index]; name = t(cat.nameKey) !== cat.nameKey ? t(cat.nameKey) : cat.name; msg = t('delete_msg_asset_cat'); }

    document.getElementById('deleteItemName').innerText = name; document.getElementById('deleteMsg').innerText = msg; deleteModal.style.display = "block"; 
}

function closeDeleteModal() { deleteModal.style.display = "none"; itemToDeleteIndex = -1; deleteTargetType = null; }

function confirmDelete() { 
    if (itemToDeleteIndex !== -1 || (typeof itemToDeleteIndex === 'string')) { 
        if (deleteTargetType === 'item') { items.splice(itemToDeleteIndex, 1); if(typeof renderTable==='function') renderTable(); } 
        else if (deleteTargetType === 'category') { categories.splice(itemToDeleteIndex, 1); if(typeof renderCategories==='function') renderCategories(); } 
        else if (deleteTargetType === 'table') { craftingTables.splice(itemToDeleteIndex, 1); if(typeof renderCraftingTables==='function') renderCraftingTables(); }
        else if (deleteTargetType === 'tier') { 
            const tierId = jobTiers[itemToDeleteIndex].id;
            jobs = jobs.filter(j => j.tierId !== tierId);
            jobTiers.splice(itemToDeleteIndex, 1); 
            if(typeof renderJobKanban === 'function') renderJobKanban();
            if(typeof renderTable === 'function') renderTable(); // Force update items
        }
        else if (deleteTargetType === 'job') {
            jobs = jobs.filter(j => j.id !== itemToDeleteIndex); 
            if(typeof renderJobKanban === 'function') renderJobKanban();
            if(typeof renderTable === 'function') renderTable(); // Force update items
        }
        else if (deleteTargetType === 'asset') {
            assets = assets.filter(a => a.id !== itemToDeleteIndex);
            if(typeof renderAssetBoard === 'function') renderAssetBoard();
        }
        else if (deleteTargetType === 'asset_cat') {
            const cat = assetCategories[itemToDeleteIndex];
            if(cat) {
                assets = assets.filter(a => a.categoryId !== cat.id);
                assetCategories.splice(itemToDeleteIndex, 1);
                if(typeof renderAssetBoard === 'function') renderAssetBoard();
            }
        }
        saveLocalData();
    } 
    closeDeleteModal(); 
}

// --- 7. GENERIC INPUT MODAL ---
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

function clearAllItems() {
    if (confirm(t('confirm_clear_all'))) {
        items = []; jobs = []; assets = [];
        saveLocalData();
        
        // Refresh all
        if(typeof renderTable === 'function') renderTable();
        if(typeof renderJobKanban === 'function') renderJobKanban();
        if(typeof renderAssetBoard === 'function') renderAssetBoard();
        
        showToast(t('toast_cleared'));
    }
}

// --- 8. INITIALIZATION ---
window.onload = function() {
    modal = document.getElementById("itemModal");
    deleteModal = document.getElementById("deleteModal");
    importModal = document.getElementById("importModal");
    inputModal = document.getElementById("inputModal");
    jobModal = document.getElementById("jobModal"); 
    assetModal = document.getElementById("assetModal");
    
    loadLocalData(); 
    
    // Core render
    if(typeof renderCategories === 'function') renderCategories();
    if(typeof renderCraftingTables === 'function') renderCraftingTables();
    if(typeof renderTable === 'function') renderTable();
    
    // Modules render
    if(typeof renderJobKanban === 'function') renderJobKanban();
    if(typeof renderAssetBoard === 'function') renderAssetBoard();
    
    setLanguage(currentLang); 
    apiKey = localStorage.getItem('redm_economy_apikey') || "";
    if(document.getElementById('configApiKey')) document.getElementById('configApiKey').value = apiKey;
};

window.onclick = function(event) { 
    if (modal && event.target == modal && typeof closeModal === 'function') closeModal(); 
    if (deleteModal && event.target == deleteModal) closeDeleteModal();
    if (importModal && event.target == importModal && typeof closeImportModal === 'function') closeImportModal();
    if (inputModal && event.target == inputModal) closeInputModal();
    if (jobModal && event.target == jobModal && typeof closeJobModal === 'function') closeJobModal();
    if (assetModal && event.target == assetModal && typeof closeAssetModal === 'function') closeAssetModal();
}