// ==========================================================
// --- ASSETS & GOALS SYSTEM (LIST VIEW WITH SORTING & EDITABLE CATEGORIES) ---
// ==========================================================

let activeAssetForUpload = null; 
// Stores sorting state: column name and direction
let currentAssetSort = { column: 'name', direction: 'asc' };

function renderAssetBoard() {
    const container = document.getElementById('assetsBoard');
    if (!container) return;
    container.innerHTML = '';

    assetCategories.forEach((cat, idx) => {
        // Wrapper for the Category Accordion
        const wrapper = document.createElement('div');
        wrapper.className = `asset-category-wrapper ${cat.collapsed ? 'collapsed' : ''}`;
        wrapper.id = `cat_wrapper_${cat.id}`;

        // --- HEADER ---
        const header = document.createElement('div');
        header.className = 'asset-category-header';
        
        // Toggle visibility on click (except inputs/buttons)
        header.onclick = (e) => {
            if(!e.target.closest('button') && !e.target.closest('input')) toggleCategory(idx);
        };
        
        // Determine Display Name: Custom Name > Translation > ID
        // Note: We use cat.name if it exists (user edited), otherwise translation
        let displayName = cat.name;
        // If cat.name is exactly the initial default key (e.g. "cat_properties"), try to translate it
        // Or if it's empty, try translation
        if (!displayName || displayName === cat.nameKey) {
             displayName = (cat.nameKey && t(cat.nameKey) !== cat.nameKey) ? t(cat.nameKey) : (cat.name || cat.id);
        }
        
        header.innerHTML = `
            <div class="asset-cat-title-group">
                <span class="asset-cat-icon">▼</span>
                
                <input type="text" 
                       class="asset-category-name-input" 
                       value="${displayName}" 
                       onchange="updateAssetCategoryName(${idx}, this.value)" 
                       onclick="event.stopPropagation()">
                
                <span style="font-size:0.8em; color:var(--cor-texto-secundario);">(${assets.filter(a => a.categoryId === cat.id).length})</span>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="btn btn-plus btn-small" onclick="openAssetModal('create', '${cat.id}')" style="width:25px; height:25px; font-size:16px;">+</button>
                <button class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff; width:25px; height:25px; padding:0; display:inline-flex; align-items:center; justify-content:center;" onclick="openDeleteModal('asset_cat', ${idx})">x</button>
            </div>
        `;

        // --- BODY (TABLE) ---
        const body = document.createElement('div');
        body.className = 'asset-category-body';
        
        const table = document.createElement('table');
        table.className = 'asset-table';
        
        // Helper to get sort icon
        const getIcon = (col) => {
            if (currentAssetSort.column === col) {
                return currentAssetSort.direction === 'asc' ? '▲' : '▼';
            }
            return '⇅';
        };

        // Table Header with Sorting Clicks
        table.innerHTML = `
            <thead>
                <tr>
                    <th width="60px">${t('col_asset_image')}</th>
                    <th onclick="handleAssetSort('name')" style="cursor:pointer;">
                        ${t('col_asset_name')} <span class="sort-icon ${currentAssetSort.column==='name'?'sort-active':''}">${getIcon('name')}</span>
                    </th>
                    <th onclick="handleAssetSort('price')" style="cursor:pointer;">
                        ${t('col_asset_price')} <span class="sort-icon ${currentAssetSort.column==='price'?'sort-active':''}">${getIcon('price')}</span>
                    </th>
                    <th onclick="handleAssetSort('upkeep')" style="cursor:pointer;">
                        ${t('col_asset_upkeep')} <span class="sort-icon ${currentAssetSort.column==='upkeep'?'sort-active':''}">${getIcon('upkeep')}</span>
                    </th>
                    <th onclick="handleAssetSort('grind')" style="cursor:pointer;">
                        ${t('col_asset_grind')} <span class="sort-icon ${currentAssetSort.column==='grind'?'sort-active':''}">${getIcon('grind')}</span>
                    </th>
                    <th width="100px">${t('col_actions')}</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        // Filter assets for this category
        let catAssets = assets.filter(a => a.categoryId === cat.id);

        // --- SORT LOGIC ---
        catAssets.sort((a, b) => {
            let valA, valB;

            switch (currentAssetSort.column) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'price':
                    valA = parseFloat(a.price) || 0;
                    valB = parseFloat(b.price) || 0;
                    break;
                case 'upkeep':
                    // Calculate daily upkeep for sorting
                    valA = (parseFloat(a.upkeepValue) || 0) / (parseFloat(a.upkeepInterval) || 1);
                    valB = (parseFloat(b.upkeepValue) || 0) / (parseFloat(b.upkeepInterval) || 1);
                    break;
                case 'grind':
                    // Grind time is directly proportional to price, so sorting by price works
                    valA = parseFloat(a.price) || 0;
                    valB = parseFloat(b.price) || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return currentAssetSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentAssetSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        if (catAssets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--cor-texto-desabilitado); padding:20px;">Nenhum ativo nesta categoria.</td></tr>`;
        } else {
            catAssets.forEach(asset => {
                const row = createAssetRow(asset);
                tbody.appendChild(row);
            });
        }

        body.appendChild(table);
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        container.appendChild(wrapper);
    });
}

// Function to handle renaming category
function updateAssetCategoryName(index, newName) {
    if (assetCategories[index]) {
        assetCategories[index].name = newName;
        // We do NOT reset nameKey so translations might still work if user clears input, 
        // but typically user overrides translation with a manual name.
        saveLocalData();
    }
}

function handleAssetSort(column) {
    if (currentAssetSort.column === column) {
        currentAssetSort.direction = currentAssetSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentAssetSort.column = column;
        currentAssetSort.direction = 'asc';
    }
    renderAssetBoard();
}

function toggleCategory(index) {
    if(assetCategories[index].collapsed === undefined) assetCategories[index].collapsed = false;
    assetCategories[index].collapsed = !assetCategories[index].collapsed;
    saveLocalData();
    renderAssetBoard(); 
}

function createAssetRow(asset) {
    const tr = document.createElement('tr');
    tr.className = 'asset-row';
    tr.onclick = (e) => { 
        if(!e.target.closest('button')) {
            openAssetModal('edit', null, asset.id); 
        }
    };

    const tierAverages = calculateGlobalTierAverages(); // Function from script_item.js logic
    
    let grindHtml = "";
    if(typeof generateGrindHtml === 'function' && typeof calculateGlobalTierAverages === 'function') {
        grindHtml = generateGrindHtml(asset.price, tierAverages, true); 
    } else {
        grindHtml = '<small>Load script_item.js</small>';
    }
    
    // Upkeep Calc
    const upkeepVal = parseFloat(asset.upkeepValue) || 0;
    const upkeepInterval = parseFloat(asset.upkeepInterval) || 1;
    const dailyUpkeep = upkeepInterval > 0 ? upkeepVal / upkeepInterval : 0;

    // Image Logic
    const imgPath = globalConfig.imagePath || "";
    const imgUrl = asset.image || "";
    let finalSrc = "";
    if (imgUrl.startsWith("http") || imgUrl.startsWith("data:")) { finalSrc = imgUrl; } 
    else if (imgUrl) { finalSrc = imgPath + imgUrl; }

    let imgContent = `<div class="asset-list-fallback">${asset.name.charAt(0)}</div>`;
    if(finalSrc) {
        imgContent = `<img src="${finalSrc}" class="asset-list-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div class="asset-list-fallback" style="display:none;">${asset.name.charAt(0)}</div>`;
    }

    tr.innerHTML = `
        <td>
            <div class="asset-list-img-box">${imgContent}</div>
        </td>
        <td>
            <strong>${asset.name}</strong>
        </td>
        <td class="col-price">
            $ ${parseFloat(asset.price).toLocaleString()}
        </td>
        <td class="col-upkeep">
            $ ${dailyUpkeep.toFixed(2)}
            <br><small style="color:var(--cor-texto-secundario);">($${upkeepVal} / ${upkeepInterval}d)</small>
        </td>
        <td>
            ${grindHtml}
        </td>
        <td>
            <div style="display:flex; gap:5px;">
                <button class="btn btn-secondary btn-small" onclick="openAssetModal('edit', null, '${asset.id}')">${t('btn_edit')}</button>
                <button class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff;" onclick="openDeleteModal('asset', '${asset.id}')">X</button>
            </div>
        </td>
    `;

    return tr;
}

// --- MODAL & CRUD ---

function openAssetModal(mode, catId, assetId) {
    assetModal = document.getElementById('assetModal');
    const form = document.getElementById('assetForm');
    form.reset();
    document.getElementById('assetGrindPreview').innerHTML = '';
    
    updateModalAssetImagePreview(""); 

    if (mode === 'create') {
        document.getElementById('asset_edit_id').value = '';
        document.getElementById('asset_cat_id').value = catId;
        document.getElementById('asset_upkeep_value').value = 0;
        document.getElementById('asset_upkeep_interval').value = 1;
        document.getElementById('asset_image_url').value = "";
    } else {
        const asset = assets.find(a => a.id === assetId);
        if(!asset) return;
        document.getElementById('asset_edit_id').value = asset.id;
        document.getElementById('asset_cat_id').value = asset.categoryId;
        document.getElementById('asset_name').value = asset.name;
        document.getElementById('asset_price').value = asset.price;
        
        document.getElementById('asset_upkeep_value').value = asset.upkeepValue || 0;
        document.getElementById('asset_upkeep_interval').value = asset.upkeepInterval || 1;
        
        document.getElementById('asset_image_url').value = asset.image || "";
        updateModalAssetImagePreview(asset.image);
        
        updateAssetGrindPreview();
    }
    
    document.getElementById('asset_price').onchange = updateAssetGrindPreview;
    document.getElementById('asset_price').onkeyup = updateAssetGrindPreview;
    
    document.getElementById('asset_upkeep_value').onchange = updateAssetUpkeepPreview;
    document.getElementById('asset_upkeep_interval').onchange = updateAssetUpkeepPreview;
    document.getElementById('asset_image_url').oninput = (e) => updateModalAssetImagePreview(e.target.value);
    
    updateAssetUpkeepPreview();

    assetModal.style.display = 'block';
}

function closeAssetModal() {
    document.getElementById('assetModal').style.display = 'none';
}

function updateModalAssetImagePreview(url) {
    const previewDiv = document.getElementById('modalAssetImagePreview');
    const imgPath = globalConfig.imagePath || "";
    
    let finalSrc = "";
    if (url && (url.startsWith("http") || url.startsWith("data:"))) {
        finalSrc = url;
    } else if (url) {
        finalSrc = imgPath + url;
    }

    if(finalSrc) {
        previewDiv.innerHTML = `<img src="${finalSrc}" style="width:100%; height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <span class="modal-image-text" style="display:none;">Imagem não encontrada</span>`;
    } else {
        previewDiv.innerHTML = `<span class="modal-image-text">Nenhuma imagem selecionada</span>`;
    }
}

function updateAssetGrindPreview() {
    const price = parseFloat(document.getElementById('asset_price').value) || 0;
    if(typeof calculateGlobalTierAverages === 'function' && typeof generateGrindHtml === 'function') {
        const tierAverages = calculateGlobalTierAverages();
        const html = generateGrindHtml(price, tierAverages, true); 
        document.getElementById('assetGrindPreview').innerHTML = html;
    }
}

function updateAssetUpkeepPreview() {
    const val = parseFloat(document.getElementById('asset_upkeep_value').value) || 0;
    const days = parseFloat(document.getElementById('asset_upkeep_interval').value) || 1;
    const daily = days > 0 ? val / days : 0;
    document.getElementById('asset_upkeep_total_display').innerText = `$ ${daily.toFixed(2)}`;
}

// Handle Form Submit
const assetForm = document.getElementById('assetForm');
if(assetForm) {
    assetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('asset_edit_id').value;
        const catId = document.getElementById('asset_cat_id').value;
        const name = document.getElementById('asset_name').value;
        const price = parseFloat(document.getElementById('asset_price').value) || 0;
        
        const upkeepVal = parseFloat(document.getElementById('asset_upkeep_value').value) || 0;
        const upkeepInterval = parseFloat(document.getElementById('asset_upkeep_interval').value) || 1;
        const upkeepDaily = upkeepInterval > 0 ? upkeepVal / upkeepInterval : 0;
        
        const imgUrl = document.getElementById('asset_image_url').value;

        const assetData = {
            id: editId || 'asset_' + Date.now(),
            categoryId: catId,
            name: name,
            price: price,
            upkeep: upkeepDaily, 
            upkeepValue: upkeepVal, 
            upkeepInterval: upkeepInterval,
            image: imgUrl
        };

        if(editId) {
            const idx = assets.findIndex(a => a.id === editId);
            if(idx !== -1) assets[idx] = assetData;
        } else {
            assets.push(assetData);
        }

        saveLocalData();
        closeAssetModal();
        renderAssetBoard();
    });
}

// --- CATEGORY MANAGEMENT ---
function addAssetCategory() {
    openInputModal('title_new_asset_cat', 'lbl_cat_asset_name', (val) => {
        const id = 'cat_' + val.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        // Initialize with collapsed: false
        assetCategories.push({ id: id, name: val, collapsed: false });
        saveLocalData();
        renderAssetBoard();
    });
}

// Ensure global confirmation knows how to re-render assets
const coreConfirmDelete = window.confirmDelete;
window.confirmDelete = function() {
    if (deleteTargetType === 'asset' || deleteTargetType === 'asset_cat') {
        if(coreConfirmDelete) coreConfirmDelete(); 
        renderAssetBoard(); 
    } else {
        if(coreConfirmDelete) coreConfirmDelete();
    }
};