// ==========================================================
// --- ASSETS & GOALS SYSTEM ---
// ==========================================================

function renderAssetBoard() {
    const container = document.getElementById('assetsBoard');
    if (!container) return;
    container.innerHTML = '';

    assetCategories.forEach((cat, idx) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'asset-category-container';
        
        const header = document.createElement('div');
        header.className = 'asset-category-header';
        
        const catName = t(cat.nameKey) !== cat.nameKey ? t(cat.nameKey) : (cat.name || cat.id);
        
        header.innerHTML = `
            <span class="asset-category-title">${catName}</span>
            <div style="display:flex; gap:5px;">
                <button class="btn btn-plus btn-small" onclick="openAssetModal('create', '${cat.id}')" style="width:25px; height:25px; font-size:16px;">+</button>
                <button class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff; width:25px; height:25px; padding:0; display:inline-flex; align-items:center; justify-content:center;" onclick="openDeleteModal('asset_cat', ${idx})">x</button>
            </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'asset-grid';

        const catAssets = assets.filter(a => a.categoryId === cat.id);
        catAssets.forEach(asset => {
            grid.appendChild(createAssetCard(asset));
        });

        catDiv.appendChild(header);
        catDiv.appendChild(grid);
        container.appendChild(catDiv);
    });
}

function createAssetCard(asset) {
    const card = document.createElement('div');
    card.className = 'asset-card';
    card.dataset.type = asset.categoryId;
    
    // Card Body Click -> Edit Modal
    card.onclick = (e) => { 
        if(!e.target.closest('button')) {
            openAssetModal('edit', null, asset.id); 
        }
    };

    const tierAverages = calculateTierAverages();
    const grindHtml = generateGrindInfoHTML(asset.price, tierAverages);
    
    const upkeepVal = parseFloat(asset.upkeepValue) || 0;
    const upkeepInterval = parseFloat(asset.upkeepInterval) || 1;
    const dailyUpkeep = upkeepVal / upkeepInterval;

    // Image Logic (PATH BASED)
    const imgPath = globalConfig.imagePath || "";
    const imgUrl = asset.image || "";
    let finalSrc = "";

    // Determine if absolute URL or relative path
    if (imgUrl.startsWith("http") || imgUrl.startsWith("data:")) {
        finalSrc = imgUrl;
    } else if (imgUrl) {
        finalSrc = imgPath + imgUrl;
    }

    let imgContent = `<div class="asset-image-fallback">${asset.name.charAt(0)}</div>`;
    
    if(finalSrc) {
        imgContent = `<img src="${finalSrc}" class="asset-image-img" style="display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                      <div class="asset-image-fallback" style="display:none;">${asset.name.charAt(0)}</div>`;
    }

    card.innerHTML = `
        <button class="btn-delete-card" onclick="openDeleteModal('asset', '${asset.id}'); event.stopPropagation();">×</button>
        
        <div class="asset-image-container">
            ${imgContent}
        </div>

        <div class="asset-header">
            <span class="asset-name">${asset.name}</span>
            <span class="asset-price-tag">$ ${parseFloat(asset.price).toLocaleString()}</span>
        </div>
        <div class="asset-upkeep">
            ${t('lbl_asset_upkeep')}: <strong>$ ${dailyUpkeep.toFixed(2)}</strong>
        </div>
        <div class="asset-grind-info">
            <div style="margin-bottom:5px; color:var(--cor-texto-secundario); font-size:0.9em; border-bottom:1px solid rgba(255,255,255,0.1);">${t('lbl_grind_estimation')}</div>
            ${grindHtml}
        </div>
    `;

    return card;
}

function updateModalImagePreview(url) {
    const previewDiv = document.getElementById('modalAssetImagePreview');
    const imgPath = globalConfig.imagePath || "";
    
    let finalSrc = "";
    if (url.startsWith("http") || url.startsWith("data:")) {
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

function calculateTierAverages() {
    let tierStats = {}; 
    jobTiers.forEach(t => {
        tierStats[t.id] = { total: 0, count: 0, avg: 0, name: t.name };
    });

    jobs.forEach(job => {
        if(tierStats[job.tierId]) {
            const calc = getJobCalculation(job);
            if(calc.perMinNpc > 0) {
                tierStats[job.tierId].total += calc.perMinNpc;
                tierStats[job.tierId].count++;
            }
        }
    });

    Object.keys(tierStats).forEach(key => {
        const t = tierStats[key];
        if(t.count > 0) {
            t.avg = t.total / t.count;
        }
    });

    return tierStats;
}

function generateGrindInfoHTML(price, tierStats) {
    let html = '';
    jobTiers.forEach(tierDef => {
        const stats = tierStats[tierDef.id];
        if(!stats || stats.avg <= 0) return;

        const minutesNeeded = price / stats.avg;
        const timeStr = formatTime(minutesNeeded);
        
        let timeClass = 'short';
        if(minutesNeeded > 180) timeClass = 'medium';
        if(minutesNeeded > 600) timeClass = 'long';

        html += `
            <div class="grind-row">
                <span class="grind-tier-name">${stats.name}:</span>
                <span class="grind-time ${timeClass}">${timeStr}</span>
            </div>
        `;
    });

    if(html === '') return `<div style="color:var(--cor-texto-desabilitado); font-style:italic;">Sem dados de jobs...</div>`;
    return html;
}

function formatTime(minutes) {
    if(minutes < 60) return `${Math.ceil(minutes)} ${t('lbl_minutes')}`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.ceil(minutes % 60);
    return `${hours}${t('lbl_hours')} ${mins}${t('lbl_minutes')}`;
}

// --- MODAL & CRUD ---

function openAssetModal(mode, catId, assetId) {
    assetModal = document.getElementById('assetModal');
    const form = document.getElementById('assetForm');
    form.reset();
    document.getElementById('assetGrindPreview').innerHTML = '';
    
    // Default image state
    updateModalImagePreview(""); 

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
        updateModalImagePreview(asset.image);
        
        updateGrindPreview();
    }
    
    document.getElementById('asset_price').onchange = updateGrindPreview;
    document.getElementById('asset_price').onkeyup = updateGrindPreview;
    
    document.getElementById('asset_upkeep_value').onchange = updateUpkeepPreview;
    document.getElementById('asset_upkeep_interval').onchange = updateUpkeepPreview;
    document.getElementById('asset_image_url').oninput = (e) => updateModalImagePreview(e.target.value);
    
    updateUpkeepPreview();

    assetModal.style.display = 'block';
}

function closeAssetModal() {
    document.getElementById('assetModal').style.display = 'none';
}

function updateGrindPreview() {
    const price = parseFloat(document.getElementById('asset_price').value) || 0;
    const tierAverages = calculateTierAverages();
    const html = generateGrindInfoHTML(price, tierAverages);
    document.getElementById('assetGrindPreview').innerHTML = html;
}

function updateUpkeepPreview() {
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
        assetCategories.push({ id: id, name: val });
        saveLocalData();
        renderAssetBoard();
    });
}

const coreConfirmDelete = window.confirmDelete;
window.confirmDelete = function() {
    if (deleteTargetType === 'asset' || deleteTargetType === 'asset_cat') {
        if(coreConfirmDelete) coreConfirmDelete(); 
        renderAssetBoard(); 
    } else {
        if(coreConfirmDelete) coreConfirmDelete();
    }
};