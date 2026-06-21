/*
  super-mode.js: Super Mode 数据编辑功能
  允许在游戏中直接修改各项数据（经费、声誉、学生属性、设施等）
*/

// Super Mode 开关状态
let superModeEnabled = false;

/**
 * 切换 Super Mode 开关
 */
function toggleSuperMode() {
  superModeEnabled = !superModeEnabled;
  const panel = document.getElementById('super-mode-panel');
  const toggleBtn = document.getElementById('super-mode-toggle');

  if (superModeEnabled) {
    if (panel) panel.style.display = 'block';
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.textContent = '🦸 Super Mode (ON)';
    }
    renderSuperModePanel();
  } else {
    if (panel) panel.style.display = 'none';
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.textContent = '🦸 Super Mode';
    }
  }
}

/**
 * 渲染 Super Mode 编辑面板
 */
function renderSuperModePanel() {
  const content = document.getElementById('super-mode-content');
  if (!content || !game) return;

  var html = '';

  // ========== 全局数据编辑 ==========
  html += '<div class="super-mode-section">';
  html += '<h4>📊 全局数据</h4>';
  html += '<div class="super-mode-row">';
  html += '<label>经费 ¥</label><input type="number" id="sm-budget" value="' + (game.budget || 0) + '" step="1000">';
  html += '<label>声誉</label><input type="number" id="sm-reputation" value="' + (game.reputation || 0) + '" step="1">';
  html += '<label>当前周</label><input type="number" id="sm-week" value="' + (game.week || 1) + '" min="1" max="52" step="1">';
  html += '</div>';
  html += '<div class="super-mode-row">';
  html += '<label>温度 °C</label><input type="number" id="sm-temperature" value="' + (game.temperature || 20) + '" step="0.1">';
  html += '<label>天气</label><select id="sm-weather" style="width:80px;padding:4px 6px;border:1px solid #fde68a;border-radius:4px;font-size:12px;">';
  html += '<option value="晴"' + (game.weather === '晴' ? ' selected' : '') + '>晴 ☀️</option>';
  html += '<option value="阴"' + (game.weather === '阴' ? ' selected' : '') + '>阴 ☁️</option>';
  html += '<option value="雨"' + (game.weather === '雨' ? ' selected' : '') + '>雨 🌧️</option>';
  html += '<option value="雪"' + (game.weather === '雪' ? ' selected' : '') + '>雪 ❄️</option>';
  html += '</select>';
  html += '<label>基础舒适度</label><input type="number" id="sm-base-comfort" value="' + (game.base_comfort || 50) + '" min="0" max="100" step="1">';
  html += '</div>';
  html += '</div>';

  // ========== 设施编辑 ==========
  html += '<div class="super-mode-section">';
  html += '<h4>🏗️ 设施等级</h4>';
  html += '<div class="super-mode-row">';
  var facNames = [
    { id: 'computer', label: '计算机', max: 5 },
    { id: 'library', label: '资料库', max: 5 },
    { id: 'ac', label: '空调', max: 3 },
    { id: 'dorm', label: '宿舍', max: 3 },
    { id: 'canteen', label: '食堂', max: 3 }
  ];
  for (var fi = 0; fi < facNames.length; fi++) {
    var f = facNames[fi];
    var curLevel = game.facilities.getCurrentLevel(f.id);
    html += '<label>' + f.label + '</label><input type="number" id="sm-fac-' + f.id + '" value="' + curLevel + '" min="1" max="' + f.max + '" step="1">';
  }
  html += '</div>';
  html += '</div>';

  // ========== 快捷增幅（算法熟练度 / 个人能力） ==========
  html += '<div class="super-mode-section">';
  html += '<h4>🎯 快捷增幅（全体学生）</h4>';
  html += '<div class="super-mode-actions">';
  html += '<button class="btn btn-super-knowledge" onclick="superModeBoostKnowledge(50)">📚 算法熟练度 +50</button>';
  html += '<button class="btn btn-super-knowledge" onclick="superModeBoostKnowledge(100)">📚 算法熟练度 +100</button>';
  html += '<button class="btn btn-super-ability" onclick="superModeBoostAbility(30)">💪 个人能力 +30</button>';
  html += '<button class="btn btn-super-ability" onclick="superModeBoostAbility(100)">💪 个人能力 +100</button>';
  html += '<button class="btn btn-super-apply" onclick="superModeBoostAll(50)">🚀 全部 +50</button>';
  html += '<button class="btn btn-super-apply" onclick="superModeBoostAll(100)">🚀 全部 +100</button>';
  html += '</div>';
  html += '<div class="small muted" style="margin-top:6px;">算法熟练度 = DS/图论/字符串/数学/DP 五个知识点各加指定值；个人能力 = 思维/代码/心理 各加指定值</div>';
  html += '</div>';

  // ========== 学生数据编辑 ==========
  html += '<div class="super-mode-section">';
  html += '<h4>👥 学生数据</h4>';

  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s) continue;
    var isActive = s.active !== false;

    html += '<div class="super-mode-student">';
    html += '<div class="student-edit-name">' + s.name + ' ' + (!isActive ? '<span style="color:#dc2626;">[已退队]</span>' : '') + '</div>';
    html += '<div class="edit-grid">';

    // 基础属性
    html += '<label>思维</label><input type="number" id="sm-s' + i + '-thinking" value="' + Math.floor(Number(s.thinking || 0)) + '" step="1">';
    html += '<label>代码</label><input type="number" id="sm-s' + i + '-coding" value="' + Math.floor(Number(s.coding || 0)) + '" step="1">';
    html += '<label>心理</label><input type="number" id="sm-s' + i + '-mental" value="' + Math.floor(Number(s.mental || 0)) + '" step="1">';
    html += '<label>压力</label><input type="number" id="sm-s' + i + '-pressure" value="' + Math.floor(Number(s.pressure || 0)) + '" min="0" max="100" step="1">';
    html += '<label>舒适度</label><input type="number" id="sm-s' + i + '-comfort" value="' + Math.floor(Number(s.comfort || 50)) + '" min="0" max="100" step="1">';

    // 知识点
    html += '<label>DS</label><input type="number" id="sm-s' + i + '-ds" value="' + Math.floor(Number(s.knowledge_ds || 0)) + '" step="1">';
    html += '<label>图论</label><input type="number" id="sm-s' + i + '-graph" value="' + Math.floor(Number(s.knowledge_graph || 0)) + '" step="1">';
    html += '<label>字符串</label><input type="number" id="sm-s' + i + '-string" value="' + Math.floor(Number(s.knowledge_string || 0)) + '" step="1">';
    html += '<label>数学</label><input type="number" id="sm-s' + i + '-math" value="' + Math.floor(Number(s.knowledge_math || 0)) + '" step="1">';
    html += '<label>DP</label><input type="number" id="sm-s' + i + '-dp" value="' + Math.floor(Number(s.knowledge_dp || 0)) + '" step="1">';

    // 状态
    html += '<label>生病周</label><input type="number" id="sm-s' + i + '-sick" value="' + (s.sick_weeks || 0) + '" min="0" step="1">';
    html += '<label>倦怠周</label><input type="number" id="sm-s' + i + '-burnout" value="' + (s.burnout_weeks || 0) + '" min="0" step="1">';
    html += '<label>活跃</label><select id="sm-s' + i + '-active" style="width:55px;padding:2px 4px;font-size:11px;border:1px solid #fde68a;border-radius:4px;">';
    html += '<option value="1"' + (isActive ? ' selected' : '') + '>是</option>';
    html += '<option value="0"' + (!isActive ? ' selected' : '') + '>否</option>';
    html += '</select>';

    html += '</div>';

    // ---- 天赋管理 ----
    html += '<div class="super-mode-talent-row">';
    html += '<span class="super-mode-talent-label">天赋：</span>';

    // 当前天赋列表（可点击移除）
    if (s.talents && s.talents.size > 0) {
      var talentArray = Array.from(s.talents);
      for (var ti = 0; ti < talentArray.length; ti++) {
        var talentName = talentArray[ti];
        var talentInfo = (window.TalentManager && window.TalentManager.getTalentInfo)
          ? window.TalentManager.getTalentInfo(talentName)
          : { name: talentName, description: '', color: '#2b6cb0' };
        var isNegative = talentInfo.kind === 'negative' || talentInfo.beneficial === false;
        var tagClass = isNegative ? 'sm-talent-tag sm-talent-negative' : 'sm-talent-tag';
        html += '<span class="' + tagClass + '" style="background-color:' + talentInfo.color + '20;color:' + talentInfo.color + ';border-color:' + talentInfo.color + '40;" title="' + (talentInfo.description || '') + ' (点击移除)">';
        html += talentName;
        html += '<button class="sm-talent-remove" onclick="superModeRemoveTalent(' + i + ', \'' + talentName.replace(/'/g, "\\'") + '\');event.stopPropagation();" title="移除 ' + talentName + '">×</button>';
        html += '</span>';
      }
    } else {
      html += '<span class="small muted">无天赋</span>';
    }

    // 添加天赋下拉框
    html += '<select id="sm-s' + i + '-addtalent" class="sm-talent-select" onchange="superModeAddTalent(' + i + ', this.value); this.value=\'\';">';
    html += '<option value="">+ 添加天赋</option>';
    if (window.TalentManager && window.TalentManager.getRegistered) {
      var allTalents = window.TalentManager.getRegistered().filter(function(n) { return !n.startsWith('__'); });
      for (var ai = 0; ai < allTalents.length; ai++) {
        var tName = allTalents[ai];
        // 跳过学生已有的天赋
        if (s.talents && s.talents.has(tName)) continue;
        var tInfo = window.TalentManager.getTalentInfo(tName);
        var isNeg = (tInfo.kind === 'negative' || tInfo.beneficial === false);
        html += '<option value="' + tName.replace(/'/g, "\\'") + '">' + (isNeg ? '🔻 ' : '✨ ') + tName + '</option>';
      }
    }
    html += '</select>';

    html += '</div>';
    // ---- 天赋管理 END ----

    html += '</div>';
  }
  html += '</div>';

  // ========== 快捷操作按钮 ==========
  html += '<div class="super-mode-section">';
  html += '<h4>⚡ 快捷操作</h4>';
  html += '<div class="super-mode-actions">';
  html += '<button class="btn btn-super-apply" onclick="applySuperModeChanges()">✅ 应用修改</button>';
  html += '<button class="btn btn-super-safe" onclick="superModeMaxFacilities()">🏗️ 满级设施</button>';
  html += '<button class="btn btn-super-safe" onclick="superModeAddBudget()">💰 +100万经费</button>';
  html += '<button class="btn btn-super-safe" onclick="superModeHealAll()">💊 治愈全体</button>';
  html += '<button class="btn btn-super-safe" onclick="superModeResetPressure()">😊 清零压力</button>';
  html += '<button class="btn btn-super-danger" onclick="superModeRefreshPanel()">🔄 刷新面板</button>';
  html += '</div>';
  html += '</div>';

  content.innerHTML = html;
}

/**
 * 应用 Super Mode 中的所有修改
 */
function applySuperModeChanges() {
  if (!game) return;

  // --- 全局数据 ---
  var budgetEl = document.getElementById('sm-budget');
  if (budgetEl) game.budget = Math.max(0, parseInt(budgetEl.value) || 0);

  var repEl = document.getElementById('sm-reputation');
  if (repEl) game.reputation = Math.max(0, parseInt(repEl.value) || 0);

  var weekEl = document.getElementById('sm-week');
  if (weekEl) game.week = Math.max(1, parseInt(weekEl.value) || 1);

  var tempEl = document.getElementById('sm-temperature');
  if (tempEl) game.temperature = parseFloat(tempEl.value) || 20;

  var weatherEl = document.getElementById('sm-weather');
  if (weatherEl) game.weather = weatherEl.value;

  var comfortEl = document.getElementById('sm-base-comfort');
  if (comfortEl) game.base_comfort = Math.max(0, Math.min(100, parseInt(comfortEl.value) || 50));

  // --- 设施 ---
  var facIds = ['computer', 'library', 'ac', 'dorm', 'canteen'];
  var facMax = { computer: 5, library: 5, ac: 3, dorm: 3, canteen: 3 };
  for (var fi = 0; fi < facIds.length; fi++) {
    var f = facIds[fi];
    var el = document.getElementById('sm-fac-' + f);
    if (!el) continue;
    var val = Math.max(1, Math.min(facMax[f], parseInt(el.value) || 1));
    if (f === 'computer') game.facilities.computer = val;
    else if (f === 'library') game.facilities.library = val;
    else if (f === 'ac') game.facilities.ac = val;
    else if (f === 'dorm') game.facilities.dorm = val;
    else if (f === 'canteen') game.facilities.canteen = val;
  }

  // --- 学生数据 ---
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s) continue;

    var thinkingEl = document.getElementById('sm-s' + i + '-thinking');
    if (thinkingEl) s.thinking = Math.max(0, parseInt(thinkingEl.value) || 0);

    var codingEl = document.getElementById('sm-s' + i + '-coding');
    if (codingEl) s.coding = Math.max(0, parseInt(codingEl.value) || 0);

    var mentalEl = document.getElementById('sm-s' + i + '-mental');
    if (mentalEl) s.mental = Math.max(0, parseInt(mentalEl.value) || 0);

    var pressureEl = document.getElementById('sm-s' + i + '-pressure');
    if (pressureEl) s.pressure = Math.max(0, Math.min(100, parseInt(pressureEl.value) || 0));

    var comfortEl2 = document.getElementById('sm-s' + i + '-comfort');
    if (comfortEl2) s.comfort = Math.max(0, Math.min(100, parseInt(comfortEl2.value) || 50));

    var dsEl = document.getElementById('sm-s' + i + '-ds');
    if (dsEl) s.knowledge_ds = Math.max(0, parseInt(dsEl.value) || 0);

    var graphEl = document.getElementById('sm-s' + i + '-graph');
    if (graphEl) s.knowledge_graph = Math.max(0, parseInt(graphEl.value) || 0);

    var stringEl = document.getElementById('sm-s' + i + '-string');
    if (stringEl) s.knowledge_string = Math.max(0, parseInt(stringEl.value) || 0);

    var mathEl = document.getElementById('sm-s' + i + '-math');
    if (mathEl) s.knowledge_math = Math.max(0, parseInt(mathEl.value) || 0);

    var dpEl = document.getElementById('sm-s' + i + '-dp');
    if (dpEl) s.knowledge_dp = Math.max(0, parseInt(dpEl.value) || 0);

    var sickEl = document.getElementById('sm-s' + i + '-sick');
    if (sickEl) s.sick_weeks = Math.max(0, parseInt(sickEl.value) || 0);

    var burnoutEl = document.getElementById('sm-s' + i + '-burnout');
    if (burnoutEl) s.burnout_weeks = Math.max(0, parseInt(burnoutEl.value) || 0);

    var activeEl = document.getElementById('sm-s' + i + '-active');
    if (activeEl) s.active = (activeEl.value === '1');
  }

  // 刷新游戏界面
  if (typeof renderAll === 'function') {
    renderAll();
  }

  // 自动保存
  try {
    localStorage.setItem('oi_coach_save', JSON.stringify(game));
  } catch (e) {
    console.error('Super Mode: 保存失败', e);
  }

  if (typeof log === 'function') {
    log('Super Mode: 数据已修改并保存');
  }

  // 刷新面板以反映最新值
  renderSuperModePanel();
}

/**
 * 刷新 Super Mode 面板（放弃未保存的修改）
 */
function superModeRefreshPanel() {
  renderSuperModePanel();
}

// ========== 快捷增幅函数 ==========

/**
 * 快捷增幅：全体学生算法熟练度（五个知识点）各加指定值
 */
function superModeBoostKnowledge(amount) {
  if (!game || !game.students) return;
  amount = amount || 50;
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s || s.active === false) continue;
    s.knowledge_ds = (s.knowledge_ds || 0) + amount;
    s.knowledge_graph = (s.knowledge_graph || 0) + amount;
    s.knowledge_string = (s.knowledge_string || 0) + amount;
    s.knowledge_math = (s.knowledge_math || 0) + amount;
    s.knowledge_dp = (s.knowledge_dp || 0) + amount;
  }
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 全体学生算法熟练度 +' + amount);
  renderSuperModePanel();
}

/**
 * 快捷增幅：全体学生个人能力（思维/代码/心理）各加指定值
 */
function superModeBoostAbility(amount) {
  if (!game || !game.students) return;
  amount = amount || 30;
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s || s.active === false) continue;
    s.thinking = (s.thinking || 0) + amount;
    s.coding = (s.coding || 0) + amount;
    s.mental = (s.mental || 0) + amount;
  }
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 全体学生个人能力 +' + amount);
  renderSuperModePanel();
}

/**
 * 快捷增幅：全体学生全部属性（知识+能力）各加指定值
 */
function superModeBoostAll(amount) {
  if (!game || !game.students) return;
  amount = amount || 50;
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s || s.active === false) continue;
    // 知识
    s.knowledge_ds = (s.knowledge_ds || 0) + amount;
    s.knowledge_graph = (s.knowledge_graph || 0) + amount;
    s.knowledge_string = (s.knowledge_string || 0) + amount;
    s.knowledge_math = (s.knowledge_math || 0) + amount;
    s.knowledge_dp = (s.knowledge_dp || 0) + amount;
    // 能力
    s.thinking = (s.thinking || 0) + amount;
    s.coding = (s.coding || 0) + amount;
    s.mental = (s.mental || 0) + amount;
  }
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 全体学生全部属性 +' + amount);
  renderSuperModePanel();
}

// ========== 天赋管理函数 ==========

/**
 * 为学生添加天赋
 */
function superModeAddTalent(studentIndex, talentName) {
  if (!game || !game.students) return;
  if (!talentName) return;
  var s = game.students[studentIndex];
  if (!s) return;
  if (!s.talents) s.talents = new Set();

  if (s.talents.has(talentName)) {
    // 已有该天赋，不重复添加
    renderSuperModePanel();
    return;
  }

  s.addTalent(talentName);

  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: ' + s.name + ' 获得了天赋【' + talentName + '】');
  renderSuperModePanel();
}

/**
 * 为学生移除天赋
 */
function superModeRemoveTalent(studentIndex, talentName) {
  if (!game || !game.students) return;
  var s = game.students[studentIndex];
  if (!s) return;
  if (!s.talents) return;

  if (!s.talents.has(talentName)) {
    renderSuperModePanel();
    return;
  }

  s.removeTalent(talentName);

  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: ' + s.name + ' 失去了天赋【' + talentName + '】');
  renderSuperModePanel();
}

// ========== 快捷操作函数 ==========

/**
 * 快捷操作：设施全满级
 */
function superModeMaxFacilities() {
  if (!game || !game.facilities) return;
  game.facilities.computer = 5;
  game.facilities.library = 5;
  game.facilities.ac = 3;
  game.facilities.dorm = 3;
  game.facilities.canteen = 3;
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 设施已全部升至满级');
  renderSuperModePanel();
}

/**
 * 快捷操作：增加100万经费
 */
function superModeAddBudget() {
  if (!game) return;
  game.budget += 1000000;
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 已添加 ¥1,000,000 经费');
  renderSuperModePanel();
}

/**
 * 快捷操作：治愈全体学生（清空生病和倦怠）
 */
function superModeHealAll() {
  if (!game || !game.students) return;
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s) continue;
    s.sick_weeks = 0;
    s.burnout_weeks = 0;
    s.comfort_modifier = 0;
    s.comfort = Math.max(s.comfort || 50, 70);
    s.mental = Math.max(s.mental || 50, 70);
  }
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 全体学生已治愈');
  renderSuperModePanel();
}

/**
 * 快捷操作：清零所有学生压力
 */
function superModeResetPressure() {
  if (!game || !game.students) return;
  for (var i = 0; i < game.students.length; i++) {
    var s = game.students[i];
    if (!s) continue;
    s.pressure = 0;
    s.pressure_modifier = 0;
    s.quit_tendency_weeks = 0;
    s.high_pressure_weeks = 0;
  }
  if (typeof renderAll === 'function') renderAll();
  try { localStorage.setItem('oi_coach_save', JSON.stringify(game)); } catch (e) {}
  if (typeof log === 'function') log('Super Mode: 全体学生压力已清零');
  renderSuperModePanel();
}

// ========== 初始化 ==========
// 在页面加载后绑定 Super Mode 切换按钮
(function initSuperMode() {
  function bindToggle() {
    var toggleBtn = document.getElementById('super-mode-toggle');
    if (toggleBtn) {
      // 移除旧的事件监听器，防止重复绑定
      var newBtn = toggleBtn.cloneNode(true);
      if (toggleBtn.parentNode) {
        toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
      }
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSuperMode();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggle);
  } else {
    bindToggle();
  }

  // 暴露到全局作用域
  window.toggleSuperMode = toggleSuperMode;
  window.renderSuperModePanel = renderSuperModePanel;
  window.applySuperModeChanges = applySuperModeChanges;
  window.superModeRefreshPanel = superModeRefreshPanel;
  window.superModeMaxFacilities = superModeMaxFacilities;
  window.superModeAddBudget = superModeAddBudget;
  window.superModeHealAll = superModeHealAll;
  window.superModeResetPressure = superModeResetPressure;
  window.superModeBoostKnowledge = superModeBoostKnowledge;
  window.superModeBoostAbility = superModeBoostAbility;
  window.superModeBoostAll = superModeBoostAll;
  window.superModeAddTalent = superModeAddTalent;
  window.superModeRemoveTalent = superModeRemoveTalent;
})();
