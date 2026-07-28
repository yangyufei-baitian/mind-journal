/* ============================================
   contacts.js — 紧急联系人管理
   ============================================ */

async function addContact() {
    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const relation = document.getElementById("contact-relation").value.trim();

    if (!name || !phone) {
        showToast("请填写姓名和电话号码");
        return;
    }

    // 简单的手机号格式检查
    if (!/^[\d\-+() ]{7,20}$/.test(phone)) {
        showToast("请输入有效的电话号码");
        return;
    }

    try {
        await saveContact({ name, phone, relationship: relation });
        document.getElementById("contact-name").value = "";
        document.getElementById("contact-phone").value = "";
        document.getElementById("contact-relation").value = "";
        showToast(`紧急联系人 "${name}" 已添加 ✅`);
        await loadContactList();
    } catch (err) {
        handleError(err, "保存联系人", { toast: true });
    }
}

async function loadContactList() {
    const container = document.getElementById("contact-list");
    const contacts = await getContacts();

    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🆘</div>
                <p>还没有添加紧急联系人</p>
            </div>`;
        return;
    }

    container.innerHTML = contacts.map(c => `
        <div class="contact-item">
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(c.name)}</div>
                <div class="contact-relation">${escapeHtml(c.relationship || "联系人")} · ${escapeHtml(c.phone)}</div>
            </div>
            <div>
                <a href="tel:${escapeHtml(c.phone)}" class="contact-call">📞 拨打</a>
                <button style="background:none;border:none;cursor:pointer;font-size:1.1rem;"
                        onclick="deleteContactById(${c.id})" title="删除">🗑️</button>
            </div>
        </div>
    `).join("");
}

async function deleteContactById(id) {
    if (!confirm("确定删除这个联系人吗？")) return;
    await deleteContact(id);
    showToast("联系人已删除");
    await loadContactList();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
