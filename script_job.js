// ==========================================================
// --- JOBS KANBAN SYSTEM (MODULE) ---
// ==========================================================

function renderJobKanban() {
    const container = document.getElementById('jobKanban');
    if (!container) return;
    container.innerHTML = '';

    jobTiers.forEach((tier, idx) => {
        const col = document.createElement('div');
        col.className = 'kanban-column';
        col.dataset.id = tier.id;

        const header = document.createElement('div');
        header.className = 'kanban-header';
        
        // Editable Title
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'kanban-title-input';
        titleInput.value = tier.name;
        titleInput.onchange = (e) => updateTierName(idx, e.target.value);
        
        // Controls
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button class="btn btn-plus btn-small" onclick="openJobModal('create', '${tier.id}')" style="width:25px; height:25px; font-size:16px;">+</button>
            <button class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff; width:25px; height:25px; padding:0; display:inline-flex; align-items:center; justify-content:center;" onclick="openDeleteModal('tier', ${idx})">x</button>
        `;
        controls.style.display = "flex"; controls.style.gap = "5px";

        header.appendChild(titleInput);
        header.appendChild(controls);

        const body = document.createElement('div');
        body.className = 'kanban-body';
        body.ondrop = (e) => dropJob(e, tier.id);
        body.ondragover = (e) => allowDrop(e);
        body.ondragleave = (e) => leaveDrop(e);

        // Render Jobs in this Tier
        const tierJobs = jobs.filter(j => j.tierId === tier.id);
        tierJobs.forEach(job => {
            const card = createJobCard(job);
            body.appendChild(card);
        });

        col.appendChild(header);
        col.appendChild(body);
        container.appendChild(col);
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.draggable = true;
    card.ondragstart = (e) => dragStart(e, job.id);
    card.onclick = (e) => { if(!e.target.closest('button')) openJobModal('edit', null, job.id); };

    // Calculate Gain
    const calc = getJobCalculation(job);

    card.innerHTML = `
        <div class="job-card-header">
            <span class="job-name">${job.name}</span>
            <button class="btn btn-small" style="background:transparent; border:none; color:var(--cor-texto-secundario); cursor:pointer; font-size:1.2em;" onclick="openDeleteModal('job', '${job.id}'); event.stopPropagation();">×</button>
        </div>
        <div class="job-stats">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                <span style="font-size:0.8em; color:var(--cor-texto-secundario);">NPC (Liq):</span>
                <span style="color:var(--cor-sucesso); font-weight:bold;">$ ${calc.perMinNpc.toFixed(2)}/min</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <span style="font-size:0.8em; color:var(--cor-texto-secundario);">P2P (Liq):</span>
                <span style="color:var(--cor-destaque); font-weight:bold;">$ ${calc.perMinP2p.toFixed(2)}/min</span>
            </div>
            <div class="job-time" style="font-size:0.75em; border-top:1px solid var(--cor-borda-muito-fraca); padding-top:4px; color:var(--cor-texto-desabilitado);">
                ⏱ ${job.time} min | ${t('lbl_job_cost')}: $${calc.totalCostNpc.toFixed(0)}
            </div>
        </div>
    `;
    return card;
}

function getJobCalculation(job) {
    // 1. Gross Gains (Ganhos Brutos)
    let grossNpc = parseFloat(job.money) || 0;
    let grossP2p = parseFloat(job.money) || 0;

    if (job.items && Array.isArray(job.items)) {
        job.items.forEach(jItem => {
            const itemObj = items.find(i => i.id === jItem.id);
            if (itemObj) {
                // Must ensure we have access to calculation logic. 
                // calculatePrices is global or from script_item.js. 
                // If script_item is not loaded yet (unlikely), fallback.
                let prices = { base:0, npcBuy:0, p2p:0 };
                if(typeof calculatePrices === 'function') {
                    prices = calculatePrices(itemObj);
                }
                
                // NPC Gain = NPC Buy Price (Sink). If 0, fallback to Base.
                let valNpc = prices.npcBuy > 0 ? prices.npcBuy : prices.base;
                // P2P Gain = P2P Price. If 0, fallback to Base.
                let valP2p = prices.p2p > 0 ? prices.p2p : prices.base;

                grossNpc += valNpc * jItem.qty;
                grossP2p += valP2p * jItem.qty;
            }
        });
    }

    // 2. Costs (Custos das Ferramentas)
    let costNpc = 0;
    let costP2p = 0;

    if (job.tools && Array.isArray(job.tools)) {
        job.tools.forEach(tool => {
            const toolItem = items.find(i => i.id === tool.id);
            if (toolItem) {
                let prices = { base:0, npcSell:0, p2p:0 };
                if(typeof calculatePrices === 'function') prices = calculatePrices(toolItem);
                
                let priceNpc = prices.npcSell > 0 ? prices.npcSell : prices.base;
                let priceP2p = prices.p2p > 0 ? prices.p2p : prices.base;

                const factor = tool.consumed ? 1 : (tool.deg / 100);
                const qty = tool.qty || 1;

                costNpc += priceNpc * qty * factor;
                costP2p += priceP2p * qty * factor;
            }
        });
    }

    // 3. Net Totals (Líquido)
    const netNpc = grossNpc - costNpc;
    const netP2p = grossP2p - costP2p;
    
    const time = job.time > 0 ? job.time : 1;

    return {
        grossNpc: grossNpc,
        totalCostNpc: costNpc,
        totalCostP2p: costP2p,
        netNpc: netNpc,
        netP2p: netP2p,
        perMinNpc: netNpc / time,
        perMinP2p: netP2p / time
    };
}

// --- DRAG & DROP ---
function dragStart(e, jobId) {
    e.dataTransfer.setData("text/plain", jobId);
    e.target.classList.add('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function leaveDrop(e) {
    e.currentTarget.classList.remove('drag-over');
}

function dropJob(e, tierId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const jobId = e.dataTransfer.getData("text/plain");
    const job = jobs.find(j => j.id === jobId);
    if(job) {
        job.tierId = tierId;
        saveLocalData();
        renderJobKanban();
        // Force update items table as averages changed
        if(typeof renderTable === 'function') renderTable();
    }
}

// --- JOB MODAL ---
function openJobModal(mode, tierId, jobId) {
    const modalEl = document.getElementById('jobModal');
    if(!modalEl) return;
    
    jobModal = modalEl; 
    const form = document.getElementById('jobForm');
    form.reset();
    document.getElementById('jobItemsContainer').innerHTML = '';
    document.getElementById('jobToolsContainer').innerHTML = '';

    if (mode === 'create') {
        document.getElementById('job_edit_id').value = '';
        document.getElementById('job_tier_id').value = tierId;
        document.getElementById('job_time').value = 60;
    } else {
        const job = jobs.find(j => j.id === jobId);
        if(!job) return;
        document.getElementById('job_edit_id').value = job.id;
        document.getElementById('job_tier_id').value = job.tierId;
        document.getElementById('job_name').value = job.name;
        document.getElementById('job_time').value = job.time;
        document.getElementById('job_money').value = job.money;
        
        if(job.items) {
            job.items.forEach(i => addJobItemRow(i.id, i.qty));
        }
        if(job.tools) {
            job.tools.forEach(t => addJobToolRow(t.id, t.qty, t.deg, t.consumed));
        }
    }
    calculateJobGains();
    jobModal.style.display = 'block';
}

function closeJobModal() {
    const el = document.getElementById('jobModal');
    if(el) el.style.display = 'none';
}

// Add Earnings Row
function addJobItemRow(id='', qty=1) {
    const container = document.getElementById('jobItemsContainer');
    const div = document.createElement('div');
    div.className = 'job-item-row';
    // Access global render helper
    let itemSelectHtml = '';
    if(typeof renderItemSearchDropdown === 'function') {
        itemSelectHtml = renderItemSearchDropdown(id, 'job-item-id', 'calculateJobGains()');
    }
    
    div.innerHTML = `
        <div style="flex:2">${itemSelectHtml}</div>
        <input type="number" class="job-item-qty" value="${qty}" min="1" placeholder="${t('ph_qty')}" style="flex:0.5" onchange="calculateJobGains()">
        <button type="button" class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff;" onclick="this.parentElement.remove(); calculateJobGains()">X</button>
    `;
    container.appendChild(div);
}

// Add Expenses Row
function addJobToolRow(id='', qty=1, deg=10, consumed=false) {
    const container = document.getElementById('jobToolsContainer');
    const div = document.createElement('div');
    div.className = 'job-tool-row';
    let itemSelectHtml = '';
    if(typeof renderItemSearchDropdown === 'function') {
        itemSelectHtml = renderItemSearchDropdown(id, 'job-tool-id', 'calculateJobGains()');
    }
    
    const isConsumedCheck = consumed ? 'checked' : '';
    const degDisabled = consumed ? 'disabled' : '';
    
    div.innerHTML = `
        <div style="flex:2">${itemSelectHtml}</div>
        <input type="number" class="job-tool-qty" value="${qty}" min="1" placeholder="${t('ph_qty')}" style="flex:0.6" onchange="calculateJobGains()">
        <input type="number" class="job-tool-deg job-tool-deg-input" value="${deg}" min="0" max="100" placeholder="%" style="flex:0.6" onchange="calculateJobGains()" ${degDisabled}>
        <div class="job-tool-options">
            <label data-tooltip="${t('tip_consumed')}">
                <input type="checkbox" class="job-tool-consumed consumed-check" ${isConsumedCheck} onchange="toggleDegInput(this); calculateJobGains()">
            </label>
        </div>
        <button type="button" class="btn btn-small" style="background:var(--cor-erro-borda); border-color:var(--cor-erro); color:#fff;" onclick="this.parentElement.remove(); calculateJobGains()">X</button>
    `;
    container.appendChild(div);
}

function toggleDegInput(checkbox) {
    const row = checkbox.closest('.job-tool-row');
    const degInput = row.querySelector('.job-tool-deg');
    if(checkbox.checked) {
        degInput.disabled = true;
    } else {
        degInput.disabled = false;
    }
}

function calculateJobGains() {
    const time = parseFloat(document.getElementById('job_time').value) || 60;
    const money = parseFloat(document.getElementById('job_money').value) || 0;
    
    let tempItems = [];
    document.querySelectorAll('.job-item-row').forEach(row => {
        const id = row.querySelector('.job-item-id').value;
        const qty = parseFloat(row.querySelector('.job-item-qty').value) || 0;
        if(id) tempItems.push({id, qty});
    });

    let tempTools = [];
    document.querySelectorAll('.job-tool-row').forEach(row => {
        const id = row.querySelector('.job-tool-id').value;
        const qty = parseFloat(row.querySelector('.job-tool-qty').value) || 0;
        const deg = parseFloat(row.querySelector('.job-tool-deg').value) || 0;
        const consumed = row.querySelector('.job-tool-consumed').checked;
        if(id) tempTools.push({id, qty, deg, consumed});
    });

    const dummyJob = {
        money: money,
        time: time,
        items: tempItems,
        tools: tempTools
    };

    const calc = getJobCalculation(dummyJob);

    document.getElementById('summary_gross').innerText = `$ ${calc.grossNpc.toFixed(2)}`;
    document.getElementById('summary_cost').innerText = `- $ ${calc.totalCostNpc.toFixed(2)}`;
    
    document.getElementById('summary_net_npc').innerText = `$ ${calc.perMinNpc.toFixed(2)} / min (Total: $${calc.netNpc.toFixed(2)})`;
    document.getElementById('summary_net_p2p').innerText = `$ ${calc.perMinP2p.toFixed(2)} / min (Total: $${calc.netP2p.toFixed(2)})`;
}

// Form Submit Listener
const jobForm = document.getElementById('jobForm');
if(jobForm) {
    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('job_edit_id').value;
        const tierId = document.getElementById('job_tier_id').value;
        const name = document.getElementById('job_name').value;
        const time = parseFloat(document.getElementById('job_time').value) || 60;
        const money = parseFloat(document.getElementById('job_money').value) || 0;
        
        let jItems = [];
        document.querySelectorAll('.job-item-row').forEach(row => {
            const id = row.querySelector('.job-item-id').value;
            const qty = parseFloat(row.querySelector('.job-item-qty').value) || 0;
            if(id) jItems.push({id, qty});
        });

        let jTools = [];
        document.querySelectorAll('.job-tool-row').forEach(row => {
            const id = row.querySelector('.job-tool-id').value;
            const qty = parseFloat(row.querySelector('.job-tool-qty').value) || 0;
            const deg = parseFloat(row.querySelector('.job-tool-deg').value) || 0;
            const consumed = row.querySelector('.job-tool-consumed').checked;
            if(id) jTools.push({id, qty, deg, consumed});
        });

        const jobData = {
            id: editId || 'job_' + Date.now(),
            tierId: tierId,
            name: name,
            time: time,
            money: money,
            items: jItems,
            tools: jTools
        };

        if(editId) {
            const idx = jobs.findIndex(j => j.id === editId);
            if(idx !== -1) jobs[idx] = jobData;
        } else {
            jobs.push(jobData);
        }

        saveLocalData();
        closeJobModal();
        renderJobKanban();
        // Force Item Table Update
        if(typeof renderTable === 'function') renderTable();
    });
}

// --- TIER MANAGEMENT ---
function addTier() {
    openInputModal('title_new_tier', 'lbl_tier_name', (val) => {
        jobTiers.push({ id: 'tier_' + Date.now(), name: val });
        saveLocalData();
        renderJobKanban();
        // Force Item Table Update (in case items rely on tier presence)
        if(typeof renderTable === 'function') renderTable();
    });
}

function updateTierName(index, newName) {
    jobTiers[index].name = newName;
    saveLocalData();
    // Force Item Table Update
    if(typeof renderTable === 'function') renderTable();
}