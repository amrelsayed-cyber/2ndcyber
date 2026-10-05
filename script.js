// ========== الإعدادات ==========
const LEADER_WHATSAPP = "201125509568"; // رقمك مع كود مصر
const LEADER_NAME = "م/ عمرو السيد";

// ========== دوال الواتساب ==========
function openLeaderChat() {
    const message = encodeURIComponent(
        `مرحباً ${LEADER_NAME}،\n` +
        `طلب بياناتي جامعية.\n` +
        `- الاسم بالكامل: \n` +
        `- رقم الواتساب: \n` +
        `- المطلوب: (الإيميل والباسورد / الكود الجامعي / اخرى "مع كتابة المطلوب")\n` +
        `- ملاحظات: `
    );
    window.open(`https://wa.me/${LEADER_WHATSAPP}?text=${message}`, '_blank');
}

function sendRequest() {
    const name = document.getElementById('fullName').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const type = document.getElementById('requestType').value;
    const notes = document.getElementById('notes').value.trim();
    
    if (!name || !whatsapp || !type) {
        alert('من فضلك أكمل كل البيانات المطلوبة');
        return;
    }
    
    const message = encodeURIComponent(
        `مرحباً ${LEADER_NAME}،\n` +
        `طلب بياناتي جامعية.\n` +
        `- الاسم بالكامل: ${name}\n` +
        `- رقم الواتساب: ${whatsapp}\n` +
        `- المطلوب: ${type}\n` +
        `- ملاحظات: ${notes || 'لا يوجد'}`
    );
    window.open(`https://wa.me/${LEADER_WHATSAPP}?text=${message}`, '_blank');
}

// ========== تحميل البيانات ==========
document.addEventListener("DOMContentLoaded", () => {
    loadMaterials();
    loadGroups();
});

// ========== المواد الدراسية ==========
function loadMaterials() {
    fetch('index.json?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            const select = document.getElementById('subjectSelect');
            const details = document.getElementById('subjectDetails');
            
            select.innerHTML = '<option value="">اختر المادة...</option>';
            for (const subject in data) {
                const opt = document.createElement('option');
                opt.value = subject;
                opt.textContent = subject;
                select.appendChild(opt);
            }
            
            details.innerHTML = '<p class="text-muted text-center">اختر مادة من القائمة لعرض الملفات</p>';
            
            select.addEventListener('change', (e) => {
                if (!e.target.value) {
                    details.innerHTML = '<p class="text-muted text-center">اختر مادة من القائمة لعرض الملفات</p>';
                    return;
                }
                renderSubject(data[e.target.value], e.target.value);
            });
        })
        .catch(err => {
            document.getElementById('subjectDetails').innerHTML = 
                '<p class="text-muted text-center">لم يتم رفع أي ملفات بعد. سيتم إضافة الملفات قريباً.</p>';
        });
}

function renderSubject(subjectData, subjectName) {
    const details = document.getElementById('subjectDetails');
    let html = `<h4 class="mb-3" style="color: var(--accent-color);">${subjectName}</h4>`;
    
    // المحاضرات
    const lectures = subjectData['Lectures'] || {};
    if (Object.keys(lectures).length > 0) {
        html += `<h5 class="mt-4 mb-3"><i class="fas fa-chalkboard-teacher"></i> المحاضرات</h5><div class="row g-3">`;
        for (const [doctor, files] of Object.entries(lectures)) {
            html += renderPersonCard(doctor, files, 'doctor');
        }
        html += `</div>`;
    }
    
    // السكاشن
    const sections = subjectData['Sections'] || {};
    if (Object.keys(sections).length > 0) {
        html += `<h5 class="mt-4 mb-3"><i class="fas fa-user-graduate"></i> السكاشن</h5><div class="row g-3">`;
        for (const [ta, files] of Object.entries(sections)) {
            html += renderPersonCard(ta, files, 'ta');
        }
        html += `</div>`;
    }
    
    // الامتحانات
    const exams = subjectData['Exams'] || [];
    if (exams.length > 0) {
        html += `<h5 class="mt-4 mb-3"><i class="fas fa-file-alt"></i> امتحانات الأعوام السابقة</h5><ul class="list-group">`;
        exams.forEach(file => {
            const name = decodeURIComponent(file.split('/').pop()).replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            html += `<li class="file-item">
                <span>${name}</span>
                <a href="${encodeURI(file)}" target="_blank" class="btn btn-sm btn-accent">فتح</a>
            </li>`;
        });
        html += `</ul>`;
    }
    
    details.innerHTML = html;
}

function renderPersonCard(name, files, type) {
    const color = type === 'doctor' ? '#06b6d4' : '#a78bfa';
    const prefix = type === 'doctor' ? 'د. ' : 'م. ';
    
    let filesHtml = '';
    if (!files || files.length === 0) {
        filesHtml = `<p class="text-muted text-center mb-0 small fst-italic">لم يتم رفع ملفات بعد</p>`;
    } else {
        files.forEach(file => {
            const name = decodeURIComponent(file.split('/').pop()).replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            filesHtml += `<div class="file-item">
                <span class="text-truncate me-2">${name}</span>
                <a href="${encodeURI(file)}" target="_blank" class="btn btn-sm btn-accent flex-shrink-0">فتح</a>
            </div>`;
        });
    }
    
    return `<div class="col-md-6">
        <div class="person-card">
            <div class="person-card-header" style="background: ${color};">
                ${prefix}${name}
            </div>
            <div class="person-card-body">${filesHtml}</div>
        </div>
    </div>`;
}

// ========== الجروبات ==========
function loadGroups() {
    fetch('groups.json?v=' + new Date().getTime())
        .then(r => r.json())
        .then(data => {
            renderBatchGroups(data.batch_groups);
            renderSubjectGroups(data.subjects);
        })
        .catch(err => console.error('Error loading groups:', err));
}

function renderBatchGroups(groups) {
    const container = document.getElementById('batch-groups-container');
    groups.sort((a, b) => a.order - b.order);
    
    container.innerHTML = groups.map(g => {
        const style = getPlatformStyle(g.type);
        return `<div class="col-md-6 col-lg-4">
            <div class="info-card d-flex justify-content-between align-items-center">
                <div>
                    <i class="${style.icon}" style="color: ${style.color}; font-size: 1.5rem;"></i>
                    <strong class="me-2">${g.name}</strong>
                </div>
                <a href="${g.link}" target="_blank" class="btn btn-sm text-white" 
                   style="background: ${style.color};">انضمام</a>
            </div>
        </div>`;
    }).join('');
}

function renderSubjectGroups(subjects) {
    const doctorsContainer = document.getElementById('doctors-groups-container');
    const tasContainer = document.getElementById('tas-groups-container');
    
    let doctorsHtml = '';
    let tasHtml = '';
    
    for (const [subject, data] of Object.entries(subjects)) {
        for (const [name, groups] of Object.entries(data.doctors || {})) {
            doctorsHtml += renderGroupCard(subject, name, groups, 'doctor');
        }
        for (const [name, groups] of Object.entries(data.tas || {})) {
            tasHtml += renderGroupCard(subject, name, groups, 'ta');
        }
    }
    
    doctorsContainer.innerHTML = doctorsHtml || '<p class="text-muted">لا توجد جروبات للدكاترة</p>';
    tasContainer.innerHTML = tasHtml || '<p class="text-muted">لا توجد جروبات للمعيدين</p>';
}

function renderGroupCard(subject, name, groups, type) {
    const color = type === 'doctor' ? '#06b6d4' : '#a78bfa';
    const prefix = type === 'doctor' ? 'د. ' : 'م. ';
    
    let linksHtml = '';
    let isEmpty = false;
    
    if (groups === "notexist" || (Array.isArray(groups) && groups.length === 0)) {
        isEmpty = true;
        linksHtml = `<p class="text-muted mb-0 small fst-italic text-center">لا يوجد جروب حتى الآن</p>`;
    } else {
        groups.sort((a, b) => a.order - b.order);
        linksHtml = groups.map(g => {
            const style = getPlatformStyle(g.type);
            return `<a href="${g.link}" target="_blank" class="btn btn-sm text-white me-1 mb-1" 
                       style="background: ${style.color};">
                <i class="${style.icon}"></i> ${g.type}
            </a>`;
        }).join('');
    }
    
    const headerColor = isEmpty ? '#475569' : color;
    
    return `<div class="col-md-6 col-lg-4 mb-3">
        <div class="person-card">
            <div class="person-card-header py-2" style="background: ${headerColor};">
                <small class="d-block opacity-75">${subject}</small>
                <strong>${prefix}${name}</strong>
            </div>
            <div class="person-card-body text-center">${linksHtml}</div>
        </div>
    </div>`;
}

function getPlatformStyle(type) {
    const styles = {
        'واتساب': { color: '#25D366', icon: 'fab fa-whatsapp' },
        'whatsapp': { color: '#25D366', icon: 'fab fa-whatsapp' },
        'تليجرام': { color: '#0088cc', icon: 'fab fa-telegram' },
        'telegram': { color: '#0088cc', icon: 'fab fa-telegram' },
        'فيسبوك': { color: '#1877F2', icon: 'fab fa-facebook' },
        'facebook': { color: '#1877F2', icon: 'fab fa-facebook' },
        'ماسنجر': { color: '#006AFF', icon: 'fab fa-facebook-messenger' },
        'messenger': { color: '#006AFF', icon: 'fab fa-facebook-messenger' }
    };
    return styles[type] || { color: '#6c757d', icon: 'fas fa-link' };
}