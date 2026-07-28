/* ============================================
   music.js — 音乐上传和播放器
   ============================================ */

async function addMusicTrack() {
    const fileInput = document.getElementById("music-file");
    const nameInput = document.getElementById("music-name");

    if (!fileInput.files || fileInput.files.length === 0) {
        showToast("请先选择一个音频文件");
        return;
    }

    const file = fileInput.files[0];

    // 限制文件大小 20MB
    if (file.size > 20 * 1024 * 1024) {
        showToast("文件太大了，请选择小于20MB的音频");
        return;
    }

    const name = nameInput.value.trim() || file.name.replace(/\.[^.]+$/, "");

    try {
        await saveMusicTrack({
            name: name,
            file_data: file,
            duration: 0
        });

        fileInput.value = "";
        nameInput.value = "";
        showToast(`"${name}" 已添加 ✅`);
        await loadMusicList();
    } catch (err) {
        handleError(err, "保存音乐", { toast: true });
    }
}

async function loadMusicList() {
    const container = document.getElementById("music-list");
    const tracks = await getMusicTracks();

    if (tracks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎶</div>
                <p>还没有添加音乐<br>选一首让你安心的歌吧</p>
            </div>`;
        return;
    }

    container.innerHTML = tracks.map(track => `
        <div class="music-item">
            <span class="music-name">🎵 ${track.name}</span>
            <div>
                <button class="music-play-btn" onclick="playMusic(${track.id})">▶ 播放</button>
                <button class="music-play-btn" style="background:#E76F6F;margin-left:4px;"
                        onclick="deleteMusic(${track.id})">🗑</button>
            </div>
        </div>
    `).join("");
}

async function playMusic(id) {
    const track = await db.musicTracks.get(id);
    if (!track) return;

    const player = document.getElementById("music-player");
    const audio = document.getElementById("audio-player");
    const nowPlaying = document.getElementById("now-playing");

    player.classList.remove("hidden");

    if (audio.src && audio.dataset.trackId == id) {
        // 同一首歌，切换播放/暂停
        if (audio.paused) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
        return;
    }

    const url = URL.createObjectURL(track.file_data);
    audio.src = url;
    audio.dataset.trackId = id;
    nowPlaying.textContent = `正在播放: ${track.name}`;
    audio.play().catch(() => {});
}

async function deleteMusic(id) {
    if (!confirm("确定删除这首歌吗？")) return;
    await deleteMusicTrack(id);
    showToast("已删除");
    await loadMusicList();
}
