/* ============================================
   medication.js — 服药管理模块
   功能: 药品搜索/添加/打卡/余量预警/详情
   ============================================ */

// ==================== 药品搜索 & 添加 ====================

function searchMedications(query, categoryId) {
    query = (query || "").toLowerCase().trim();
    let results = MEDICATION_DB;

    if (categoryId && categoryId !== "all") {
        results = results.filter(m => m.category_group === categoryId);
    }
    if (query) {
        results = results.filter(m =>
            m.name.includes(query) ||
            m.name_en.toLowerCase().includes(query) ||
            (m.brands || []).some(b => b.toLowerCase().includes(query))
        );
    }
    return results.slice(0, 20); // 最多返回20条
}

// 打开药品管理弹窗
async function showMedicationManager() {
    const overlay = document.getElementById("med-manager-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    renderMedManagerContent();
}

function closeMedicationManager() {
    const overlay = document.getElementById("med-manager-overlay");
    if (overlay) overlay.style.display = "none";
}

async function renderMedManagerContent() {
    const container = document.getElementById("med-manager-content");
    if (!container) return;

    const userMeds = await getUserMedications();

    container.innerHTML = `
        <div class="med-manager-header">
            <h3>💊 药品管理</h3>
            <button class="btn-close" onclick="closeMedicationManager()">✕</button>
        </div>

        <!-- 搜索添加区 -->
        <div class="med-search-section">
            <h4>🔍 添加药品</h4>
            <div class="med-search-row">
                <select id="med-category-filter" onchange="renderMedSearchResults()">
                    ${MED_CATEGORY_GROUPS.map(g => `<option value="${g.id}">${g.label}</option>`).join("")}
                </select>
                <input type="text" id="med-search-input" placeholder="搜索药品名或商品名..."
                       oninput="renderMedSearchResults()" class="input-full">
            </div>
            <div id="med-search-results" class="med-search-results"></div>
        </div>

        <!-- 已添加药品 -->
        <div class="med-my-list-section">
            <h4>📋 我的药品 (${userMeds.length})</h4>
            <div id="med-my-list">
                ${userMeds.length === 0 ? '<p class="med-empty">还没有添加药品，请在上方搜索添加</p>' : ''}
            </div>
        </div>
    `;

    // 渲染已添加列表
    renderMyMedList(userMeds);
    // 初始化搜索结果
    renderMedSearchResults();
}

function renderMedSearchResults() {
    const container = document.getElementById("med-search-results");
    if (!container) return;

    const query = document.getElementById("med-search-input")?.value || "";
    const category = document.getElementById("med-category-filter")?.value || "all";
    const results = searchMedications(query, category);

    if (results.length === 0) {
        container.innerHTML = '<p class="med-empty">未找到匹配的药品</p>';
        return;
    }

    container.innerHTML = results.map(m => `
        <div class="med-search-item" onclick="showAddMedForm('${m.id}')">
            <div class="med-search-item-left">
                <div class="med-search-item-name">💊 ${m.name} <span class="med-name-en">${m.name_en}</span></div>
                <div class="med-search-item-meta">
                    <span class="med-badge-cat">${m.category}</span>
                    ${(m.brands || []).slice(0, 3).map(b => `<span class="med-badge-brand">${b}</span>`).join("")}
                </div>
            </div>
            <span class="med-search-item-add">＋</span>
        </div>
    `).join("");
}

// ==================== 添加药品表单 ====================

async function showAddMedForm(medId) {
    const med = getMedicationInfo(medId);
    if (!med) return;

    const container = document.getElementById("med-search-results");
    if (!container) return;

    container.innerHTML = `
        <div class="med-add-form">
            <div class="med-add-form-header">
                <span>📝 添加：<strong>${med.name}</strong> (${med.name_en})</span>
                <button class="btn-text" onclick="renderMedSearchResults()">取消</button>
            </div>

            <div class="form-row">
                <label>剂量</label>
                <div class="dose-input-row">
                    <input type="number" id="med-dose-val" value="${parseInt(med.common_dosages[0]) || 50}" class="input-sm" min="0.5" step="0.5">
                    <select id="med-dose-unit">
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                        <option value="μg">μg</option>
                        <option value="片">片</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <label>服药时段</label>
                <div class="med-freq-grid" id="med-freq-select">
                    ${MED_TIME_SLOTS.map(s => `
                        <label class="med-freq-btn">
                            <input type="checkbox" value="${s.id}" onchange="updateMedFreqPreview()">
                            <span>${s.icon} ${s.label}</span>
                        </label>
                    `).join("")}
                </div>
            </div>

            <div class="form-row">
                <label>每次 <span id="med-pills-label">?</span> 粒 | 每日共 <span id="med-daily-label">?</span> 粒</label>
                <input type="number" id="med-pills-per-dose" value="1" min="0.25" step="0.5"
                       onchange="updateMedFreqPreview()" style="width:80px;">
            </div>

            <div class="form-row">
                <label>一盒总粒数</label>
                <input type="number" id="med-total-pills" value="28" min="1" style="width:100px;">
            </div>

            <div class="form-row">
                <label>开始日期</label>
                <input type="date" id="med-start-date" value="${new Date().toISOString().split('T')[0]}">
            </div>

            <button class="btn-primary" onclick="confirmAddMedication('${medId}')">✅ 确认添加</button>
            <div id="med-add-error" class="med-error" style="display:none;"></div>
        </div>
    `;

    updateMedFreqPreview();
}

function updateMedFreqPreview() {
    const checkboxes = document.querySelectorAll("#med-freq-select input[type=checkbox]");
    const pills = parseInt(document.getElementById("med-pills-per-dose")?.value) || 1;
    let count = 0;
    checkboxes.forEach(cb => { if (cb.checked) count++; });

    const pillsLabel = document.getElementById("med-pills-label");
    const dailyLabel = document.getElementById("med-daily-label");
    if (pillsLabel) pillsLabel.textContent = pills;
    if (dailyLabel) dailyLabel.textContent = count * pills;
}

async function confirmAddMedication(medId) {
    const med = getMedicationInfo(medId);
    if (!med) return;

    const dose = parseFloat(document.getElementById("med-dose-val")?.value) || 0;
    const unit = document.getElementById("med-dose-unit")?.value || "mg";
    const pills = parseFloat(document.getElementById("med-pills-per-dose")?.value) || 1;
    const total = parseInt(document.getElementById("med-total-pills")?.value) || 28;
    const startDate = document.getElementById("med-start-date")?.value || "";

    const frequency = {};
    document.querySelectorAll("#med-freq-select input[type=checkbox]").forEach(cb => {
        frequency[cb.value] = cb.checked;
    });

    const hasSelection = Object.values(frequency).some(v => v);
    if (!hasSelection) {
        const err = document.getElementById("med-add-error");
        if (err) { err.textContent = "请至少选择一个服药时段"; err.style.display = "block"; }
        return;
    }
    if (!dose || dose <= 0) {
        const err = document.getElementById("med-add-error");
        if (err) { err.textContent = "请输入有效剂量"; err.style.display = "block"; }
        return;
    }

    await addUserMedication({
        med_id: medId,
        custom_dose: dose,
        dose_unit: unit,
        pills_per_dose: pills,
        frequency: frequency,
        total_pills: total,
        start_date: startDate
    });

    // 刷新管理页面和打卡区
    await renderMedManagerContent();
    await renderMedicationCheckins();
    showToast("已添加 " + med.name);
}

// ==================== 已添加药品列表（管理弹窗内） ====================

async function renderMyMedList(userMeds) {
    const container = document.getElementById("med-my-list");
    if (!container) return;

    if (userMeds.length === 0) return;

    container.innerHTML = userMeds.map(um => {
        const med = getMedicationInfo(um.med_id);
        const freqLabels = MED_TIME_SLOTS
            .filter(s => um.frequency && um.frequency[s.id])
            .map(s => s.label)
            .join("·");
        const status = calculatePillRemaining(um);

        return `
            <div class="med-my-item">
                <div class="med-my-item-left">
                    <div class="med-my-item-name">
                        💊 ${med ? med.name : um.med_id}
                        <span class="med-my-dose">${um.custom_dose}${um.dose_unit} | ${freqLabels}各${um.pills_per_dose}粒</span>
                    </div>
                    <div class="med-my-item-status">
                        📦 剩余 ${status.remaining} 粒 · 约 ${status.daysLeft} 天
                        <span class="med-status-${status.warningLevel}">
                            ${status.warningLevel === "danger" ? "🔴 即将断药！" : status.warningLevel === "warning" ? "🟡 该去医院了" : "🟢"}
                        </span>
                    </div>
                </div>
                <button class="btn-danger-sm" onclick="removeMedConfirm(${um.id})">✕</button>
            </div>
        `;
    }).join("");
}

async function removeMedConfirm(id) {
    if (confirm("确定删除该药品及所有打卡记录吗？")) {
        await removeUserMedication(id);
        await renderMedManagerContent();
        await renderMedicationCheckins();
        showToast("已删除");
    }
}

// ==================== 每日打卡区（记录页） ====================

async function renderMedicationCheckins() {
    const container = document.getElementById("medication-checkin-area");
    if (!container) return;

    const userMeds = await getUserMedications();
    if (userMeds.length === 0) {
        container.innerHTML = '<p class="med-empty-hint">点击下方按钮添加你的药品</p>';
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    container.innerHTML = userMeds.map(um => {
        const med = getMedicationInfo(um.med_id);
        const status = calculatePillRemaining(um);
        const freq = um.frequency || {};
        const slots = MED_TIME_SLOTS.filter(s => freq[s.id]);

        // 检查今日打卡状态
        return `
            <div class="med-checkin-card ${status.warningLevel === "danger" ? "med-card-danger" : ""}">
                <div class="med-checkin-top">
                    <div class="med-checkin-name" onclick="showMedicationDetail(${um.id})">
                        💊 ${med ? med.name : um.med_id}
                        <span class="med-dosage">${um.custom_dose}${um.dose_unit}</span>
                        <span class="med-detail-link">详情 ›</span>
                    </div>
                </div>
                <div class="med-checkin-slots" id="med-slots-${um.id}">
                    ${slots.map(s => `
                        <button class="med-circle-btn" id="med-btn-${um.id}-${s.id}"
                                onclick="checkInMedication(${um.id},'${today}','${s.id}')"
                                title="${s.label}">
                            ${s.icon}
                        </button>
                    `).join("")}
                </div>
                <div class="med-checkin-status">
                    📦 剩余 <strong>${status.remaining}</strong> 粒 · 约 <strong>${status.daysLeft}</strong> 天
                    ${status.warningLevel !== "normal" ? `
                        <span class="med-alert-${status.warningLevel}">
                            ${status.warningLevel === "danger" ? "🔴 即将断药！请尽快就医取药" : "🟡 请提前预约复诊"}
                        </span>
                    ` : ""}
                </div>
            </div>
        `;
    }).join("");

    // 更新每个药品的打卡状态
    for (const um of userMeds) {
        await updateMedCheckinCircles(um, today);
    }
}

async function updateMedCheckinCircles(um, date) {
    const logs = await getTodayMedicationLog(um.id);
    const freq = um.frequency || {};
    const slots = MED_TIME_SLOTS.filter(s => freq[s.id]);

    for (const s of slots) {
        const btn = document.getElementById(`med-btn-${um.id}-${s.id}`);
        if (!btn) continue;

        const taken = logs.some(l => l.period === s.id);
        if (taken) {
            btn.classList.add("checked");
            btn.textContent = "✅";
        } else {
            btn.classList.remove("checked");
            btn.textContent = s.icon;
        }
    }
}

async function checkInMedication(userMedId, date, period) {
    const taken = await toggleMedicationCheck(userMedId, date, period);
    const um = await db.userMedications.get(userMedId);
    if (um) await updateMedCheckinCircles(um, date);

    const periodLabel = MED_TIME_SLOTS.find(s => s.id === period)?.label || period;
    showToast(taken ? `✅ 已打卡：${periodLabel}` : `已取消：${periodLabel}`);
}

// ==================== 药品详情弹窗 ====================

async function showMedicationDetail(userMedId) {
    const um = await db.userMedications.get(userMedId);
    if (!um) return;

    const med = getMedicationInfo(um.med_id);
    if (!med) return;

    const status = calculatePillRemaining(um);
    const freq = um.frequency || {};
    const freqLabels = MED_TIME_SLOTS.filter(s => freq[s.id]).map(s => s.icon + s.label).join(" · ") || "未设置";

    const overlay = document.getElementById("med-detail-overlay");
    const content = document.getElementById("med-detail-content");
    if (!overlay || !content) return;

    content.innerHTML = `
        <div class="med-detail-header">
            <h3>💊 ${med.name}</h3>
            <button class="btn-close" onclick="closeMedicationDetail()">✕</button>
        </div>

        <div class="med-detail-body">
            <div class="med-detail-row">
                <span class="med-detail-label">通用名</span>
                <span>${med.name}（${med.name_en}）</span>
            </div>
            <div class="med-detail-row">
                <span class="med-detail-label">商品名</span>
                <span>${(med.brands || []).join("、") || "—"}</span>
            </div>
            <div class="med-detail-row">
                <span class="med-detail-label">分类</span>
                <span class="med-badge-cat">${med.category}</span>
            </div>
            <div class="med-detail-row">
                <span class="med-detail-label">半衰期</span>
                <span>${med.half_life || "—"}</span>
            </div>

            <hr>

            <div class="med-detail-row">
                <span class="med-detail-label">我的剂量</span>
                <span><strong>${um.custom_dose}${um.dose_unit}</strong> | ${freqLabels} | 每次${um.pills_per_dose}粒</span>
            </div>
            <div class="med-detail-row">
                <span class="med-detail-label">一盒</span>
                <span>${um.total_pills} 粒 | 从 ${um.start_date} 开始</span>
            </div>

            <!-- 余量预警 -->
            <div class="med-remaining-box med-remaining-${status.warningLevel}">
                <div class="med-remaining-num">${status.remaining}</div>
                <div class="med-remaining-label">剩余粒数</div>
                <div class="med-remaining-num">${status.daysLeft}</div>
                <div class="med-remaining-label">预计天数</div>
                <div class="med-remaining-num">${status.pillsPerDay}</div>
                <div class="med-remaining-label">每日粒数</div>
                ${status.warningLevel === "danger" ?
                    '<p class="med-alert-danger">⚠️ 即将断药！苯二氮䓬类和抗抑郁药突然停药可致严重戒断反应，请立即预约复诊取药</p>' :
                    status.warningLevel === "warning" ?
                    '<p class="med-alert-warning">⚠️ 剩余不足7天，请提前预约复诊</p>' : ''}
            </div>

            <!-- ⚠️ 禁忌 -->
            <div class="med-contraindications">
                <h4>⚠️ 重要禁忌与注意事项</h4>
                ${(med.contraindications || []).map(c => `
                    <div class="med-contra-item med-contra-${c.severity}">
                        ${c.severity === "danger" ? "🚫" : "⚠️"} ${c.text}
                    </div>
                `).join("")}
            </div>

            <div class="med-detail-desc">
                <h4>📖 简介</h4>
                <p>${med.description}</p>
            </div>
        </div>
    `;

    overlay.style.display = "flex";
}

function closeMedicationDetail() {
    const overlay = document.getElementById("med-detail-overlay");
    if (overlay) overlay.style.display = "none";
}
