'use strict';

// ════════════════════════════════════════════════
// USERS NOW FETCHED FROM BACKEND ORACLE DB
// ════════════════════════════════════════════════

// ════════════════════════════════════════════════
// CHENNAI METRO DATA
// 3 Lines, 43 stations, 3 interchange points:
//   St. Thomas Mount → Blue Line ↔ Red Line
//   Alandur          → Blue Line ↔ Green Line
//   Koyambedu        → Green Line ↔ Red Line
// ════════════════════════════════════════════════
const LINES = {
  blue: { id: 'blue', name: 'Blue Line', color: '#2563eb', interval: 8, terminus: 'Chennai Airport' },
  green: { id: 'green', name: 'Green Line', color: '#16a34a', interval: 10, terminus: 'Wimco Nagar' },
  red: { id: 'red', name: 'Red Line', color: '#dc2626', interval: 9, terminus: 'St. Thomas Mount' },
};

/**
 * Blue Line  — Airport corridor (W → NE), 15 stations
 * Green Line — North–South spine, 14 stations
 * Red Line   — West ring, 14 stations
 *
 * Interchanges (each appears in exactly 2 lines):
 *   St. Thomas Mount : Blue (order 3)  ↔ Red (order 1)
 *   Alandur          : Blue (order 4)  ↔ Green (order 11)
 *   Koyambedu        : Green (order 6) ↔ Red (order 7)
 */
const STATIONS = [
  // ── Blue Line: Chennai Airport → High Court ──
  { id: 'b1', name: 'Chennai Airport', line: 'blue', order: 1 },
  { id: 'b2', name: 'Meenambakkam', line: 'blue', order: 2 },
  { id: 'b3', name: 'St. Thomas Mount', line: 'blue', order: 3 }, // ↔ Red
  { id: 'b4', name: 'Alandur', line: 'blue', order: 4 }, // ↔ Green
  { id: 'b5', name: 'Ekkattuthangal', line: 'blue', order: 5 },
  { id: 'b6', name: 'Guindy', line: 'blue', order: 6 },
  { id: 'b7', name: 'Little Mount', line: 'blue', order: 7 },
  { id: 'b8', name: 'Saidapet', line: 'blue', order: 8 },
  { id: 'b9', name: 'AG-DMS', line: 'blue', order: 9 },
  { id: 'b10', name: 'Teynampet', line: 'blue', order: 10 },
  { id: 'b11', name: 'Thousand Lights', line: 'blue', order: 11 },
  { id: 'b12', name: 'Anna Salai', line: 'blue', order: 12 },
  { id: 'b13', name: 'Central', line: 'blue', order: 13 },
  { id: 'b14', name: 'Government Estate', line: 'blue', order: 14 },
  { id: 'b15', name: 'High Court', line: 'blue', order: 15 },

  // ── Green Line: Wimco Nagar → Chromepet ──
  { id: 'g1', name: 'Wimco Nagar', line: 'green', order: 1 },
  { id: 'g2', name: 'Thiruvotriyur', line: 'green', order: 2 },
  { id: 'g3', name: 'Kolathur', line: 'green', order: 3 },
  { id: 'g4', name: 'Villivakkam', line: 'green', order: 4 },
  { id: 'g5', name: 'Arumbakkam', line: 'green', order: 5 },
  { id: 'g6', name: 'Koyambedu', line: 'green', order: 6 }, // ↔ Red
  { id: 'g7', name: 'CMBT', line: 'green', order: 7 },
  { id: 'g8', name: 'Vadapalani', line: 'green', order: 8 },
  { id: 'g9', name: 'Ashok Nagar', line: 'green', order: 9 },
  { id: 'g10', name: 'Kodambakkam', line: 'green', order: 10 },
  { id: 'g11', name: 'Alandur', line: 'green', order: 11 }, // ↔ Blue
  { id: 'g12', name: 'Nanganallur Road', line: 'green', order: 12 },
  { id: 'g13', name: 'Pallavaram', line: 'green', order: 13 },
  { id: 'g14', name: 'Chromepet', line: 'green', order: 14 },

  // ── Red Line: St. Thomas Mount → Tirumullaivayil ──
  { id: 'r1', name: 'St. Thomas Mount', line: 'red', order: 1 }, // ↔ Blue
  { id: 'r2', name: 'Moovarasampet', line: 'red', order: 2 },
  { id: 'r3', name: 'Virugambakkam', line: 'red', order: 3 },
  { id: 'r4', name: 'Nesapakkam', line: 'red', order: 4 },
  { id: 'r5', name: 'Valasaravakkam', line: 'red', order: 5 },
  { id: 'r6', name: 'Mugalivakkam', line: 'red', order: 6 },
  { id: 'r7', name: 'Koyambedu', line: 'red', order: 7 }, // ↔ Green
  { id: 'r8', name: 'Aminjikarai', line: 'red', order: 8 },
  { id: 'r9', name: 'Chetpet', line: 'red', order: 9 },
  { id: 'r10', name: 'Nungambakkam', line: 'red', order: 10 },
  { id: 'r11', name: 'Anna Nagar East', line: 'red', order: 11 },
  { id: 'r12', name: 'Anna Nagar West', line: 'red', order: 12 },
  { id: 'r13', name: 'Thirumangalam', line: 'red', order: 13 },
  { id: 'r14', name: 'Tirumullaivayil', line: 'red', order: 14 },
];

/**
 * 3 interchange stations:
 *   Blue↔Red   via St. Thomas Mount (direct, 1 transfer)
 *   Blue↔Green via Alandur           (direct, 1 transfer)
 *   Green↔Red  via Koyambedu         (direct, 1 transfer)
 * Blue→Red can now go directly (1 change) OR via Green (2 changes).
 * Dijkstra will always pick the fewest-transfer route.
 */
const INTERCHANGES = {
  'St. Thomas Mount': ['blue', 'red'],
  'Alandur': ['blue', 'green'],
  'Koyambedu': ['green', 'red'],
};

const FARE_BASE = 10;
const FARE_PER_STATION = 3;
const AVG_MIN_PER_STOP = 2.5; // minutes between stations

// ════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════
let currentUser = null;
let ticketDB = JSON.parse(localStorage.getItem('metroTicketDB')) || {};
let pendingTicket = null;

// ════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════
async function login() {
  const uid = document.getElementById('loginUserId').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!uid || !pass) { showToast('Please enter User ID and Password', 'error'); return; }
  
  try {
    const res = await fetch('http://localhost:3005/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uid, password: pass })
    });
    
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Invalid User ID or Password', 'error');
      return;
    }
    
    // currentUser maps to PASSENGER table row fetched from DB
    const user = data.user;
    currentUser = {
      passenger_id: user.passenger_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
    
    if (!ticketDB[currentUser.passenger_id]) ticketDB[currentUser.passenger_id] = [];
    document.getElementById('navUser').textContent = `👤 ${user.name}`;
    document.getElementById('homeGreeting').textContent = `👋 Hello, ${user.name}`;
    showPage('dashboard');
    showTab('home');
    showToast(`Welcome, ${user.name}!`, 'success');
  } catch (err) {
    console.error('Login Error:', err);
    showToast('Cannot connect to login server', 'error');
  }
}

function logout() {
  currentUser = null; pendingTicket = null;
  document.getElementById('loginUserId').value = '';
  document.getElementById('loginPassword').value = '';
  resetBookingFlow();
  showPage('login');
}

async function signup() {
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const phone    = document.getElementById('signupPhone').value.trim();

  if (!username) { showToast('Username is required', 'error'); return; }
  if (!password) { showToast('Password is required', 'error'); return; }
  if (!name)     { showToast('Full name is required', 'error'); return; }

  try {
    const res = await fetch('http://localhost:3005/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, email, phone })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Registration failed', 'error');
      return;
    }
    // Clear signup fields
    ['signupUsername','signupPassword','signupName','signupEmail','signupPhone']
      .forEach(id => document.getElementById(id).value = '');
    showPage('login');
    showToast('Account created! You can now log in.', 'success');
  } catch (err) {
    console.error('Signup Error:', err);
    showToast('Cannot connect to server', 'error');
  }
}

// ════════════════════════════════════════════════
// PAGE / TAB NAVIGATION
// ════════════════════════════════════════════════
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(`page-${pageId}`);
  if (t) t.classList.add('active');
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  const navBtn = document.getElementById(`ntab-${tabId}`);
  if (navBtn) navBtn.classList.add('active');
  if (tabId === 'history') {
    document.getElementById('historyListView').style.display = 'block';
    document.getElementById('historyDetailView').style.display = 'none';
    renderHistory();
  }
  if (tabId === 'booking') { populateDropdowns(); resetBookingFlow(); }
  if (tabId === 'map') renderMap();
}

// ════════════════════════════════════════════════
// DROPDOWN POPULATION
// ════════════════════════════════════════════════
async function populateDropdowns() {
  const fromSel = document.getElementById('fromStation');
  const toSel = document.getElementById('toStation');

  let stations = [];
  try {
    const res = await fetch('http://localhost:3005/stations');
    stations = await res.json();
    // Sort stations alphabetically by name
    stations.sort((a, b) => a.STATION_NAME.localeCompare(b.STATION_NAME));
  } catch (err) {
    console.error('Failed to fetch stations:', err);
  }

  const generateOptions = (currentVal) => {
    let html = '<option value="">-- Select Station --</option>';
    stations.forEach(s => {
      const isSelected = String(s.STATION_ID) === String(currentVal) ? ' selected' : '';
      html += `<option value="${s.STATION_ID}"${isSelected}>${s.STATION_NAME}</option>`;
    });
    return html;
  };

  fromSel.innerHTML = generateOptions(fromSel.value);
  toSel.innerHTML = generateOptions(toSel.value);
}
function getUniqueStationNames() {
  return [...new Set(STATIONS.map(s => s.name))].sort();
}

// ── TRAIN SCHEDULE ──────────────────────────────────
// (Frontend calculation replaced by renderTrainTimings)

// ════════════════════════════════════════════════
// ROUTE FINDING — Dijkstra minimising transfers first, then stops
// Composite cost: transfers * TRANSFER_PENALTY + stops
// TRANSFER_PENALTY >> max possible stops, so fewer transfers always wins.
// ════════════════════════════════════════════════
const TRANSFER_PENALTY = 1000; // >> 43 stations, ensures transfer count dominates

function buildGraph() {
  const graph = {};
  STATIONS.forEach(s => { graph[s.id] = []; });

  // Same-line sequential edges (stops cost = 1, transfers = 0)
  const byLine = {};
  STATIONS.forEach(s => { (byLine[s.line] = byLine[s.line] || []).push(s); });
  Object.values(byLine).forEach(ls => {
    ls.sort((a, b) => a.order - b.order);
    for (let i = 0; i < ls.length - 1; i++) {
      graph[ls[i].id].push({ id: ls[i + 1].id, stopCost: 1, transferCost: 0 });
      graph[ls[i + 1].id].push({ id: ls[i].id, stopCost: 1, transferCost: 0 });
    }
  });

  // Interchange edges (no stop cost, 1 transfer)
  const byName = {};
  STATIONS.forEach(s => { (byName[s.name] = byName[s.name] || []).push(s); });
  Object.values(byName).forEach(grp => {
    for (let i = 0; i < grp.length; i++)
      for (let j = i + 1; j < grp.length; j++) {
        graph[grp[i].id].push({ id: grp[j].id, stopCost: 0, transferCost: TRANSFER_PENALTY });
        graph[grp[j].id].push({ id: grp[i].id, stopCost: 0, transferCost: TRANSFER_PENALTY });
      }
  });
  return graph;
}

/**
 * Dijkstra with composite cost = transfers*TRANSFER_PENALTY + stops.
 * This GUARANTEES fewest line switches, then shortest path among ties.
 * Returns { path: [stationId, ...], transfers: n, stops: n } or null.
 */
function bfsRoute(fromName, toName) {
  const graph = buildGraph();
  const fromNodes = STATIONS.filter(s => s.name === fromName).map(s => s.id);
  const toSet = new Set(STATIONS.filter(s => s.name === toName).map(s => s.id));
  if (!fromNodes.length || !toSet.size) return null;

  // dist[id] = { cost, transfers, stops, path }
  const dist = {};
  STATIONS.forEach(s => { dist[s.id] = { cost: Infinity, path: [] }; });

  const queue = [];
  fromNodes.forEach(id => {
    dist[id] = { cost: 0, path: [id] };
    queue.push({ id, cost: 0, path: [id] });
  });

  let best = null;

  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: cur, cost: curCost, path } = queue.shift();

    if (curCost > dist[cur].cost) continue; // stale

    if (toSet.has(cur)) {
      if (!best || curCost < best.cost) best = { cost: curCost, path };
      continue;
    }

    for (const nb of graph[cur] || []) {
      const newCost = curCost + nb.stopCost + nb.transferCost;
      if (newCost < dist[nb.id].cost) {
        dist[nb.id] = { cost: newCost, path: [...path, nb.id] };
        queue.push({ id: nb.id, cost: newCost, path: [...path, nb.id] });
      }
    }
  }

  return best ? best.path : null;
}

function pathToSegments(path) {
  if (!path || !path.length) return [];
  const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  const segs = [];
  let cur = { line: byId[path[0]].line, stations: [byId[path[0]]] };
  for (let i = 1; i < path.length; i++) {
    const st = byId[path[i]], prev = byId[path[i - 1]];
    if (st.name === prev.name && st.line !== prev.line) { segs.push(cur); cur = { line: st.line, stations: [st] }; }
    else if (st.line !== cur.line) { segs.push(cur); cur = { line: st.line, stations: [st] }; }
    else { cur.stations.push(st); }
  }
  segs.push(cur);
  return segs;
}

function calculateFare(totalStops) {
  return FARE_BASE + Math.max(0, totalStops - 1) * FARE_PER_STATION;
}

async function findAndBook() {
  const fromSel = document.getElementById('fromStation');
  const toSel = document.getElementById('toStation');
  const count = parseInt(document.getElementById('numTickets').value) || 1;

  const fromId = fromSel.value;
  const toId = toSel.value;

  if (!fromId) { showToast('Please select Start Station', 'error'); return; }
  if (!toId) { showToast('Please select End Station', 'error'); return; }
  if (fromId === toId) { showToast('Start and End cannot be the same', 'error'); return; }
  if (count < 1 || count > 10) { showToast('Tickets must be between 1 and 10', 'error'); return; }

  // Extract station names to feed into the local graph algorithm for visual rendering
  const fromName = fromSel.options[fromSel.selectedIndex].text;
  const toName = toSel.options[toSel.selectedIndex].text;

  // 1. Traverse local graph for full beautiful visual path rendering!
  const path = bfsRoute(fromName, toName);
  if (!path) { showToast('No route found between selected stations', 'error'); return; }

  const segments = pathToSegments(path);
  const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  const uniqueNames = [...new Set(path.map(id => byId[id].name))];
  const totalStops = uniqueNames.length;
  const fare = calculateFare(totalStops);
  const total = fare * count;

  try {
    // 2. Fetch the corresponding ROUTE_ID from the Oracle Database to use for TICKET insertion
    const response = await fetch('http://localhost:3005/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_station_id: fromId,
        destination_station_id: toId
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      showToast(errData.error || 'Failed to fetch DB route', 'error');
      return;
    }

    const routeDataArray = await response.json();
    if (routeDataArray.length === 0) {
      showToast('No route found in the database', 'error');
      return;
    }
    const dbRoute = routeDataArray[0];

    // We now use the OFFICIAL FARE calculated by the backend!
    const fare = dbRoute.FARE || 30;
    const total = fare * count;

    // 3. Populate ticket
    const now = new Date();
    pendingTicket = {
      ticket_id: generateId(),
      passenger_id: currentUser ? currentUser.passenger_id : 1,
      booking_time: now.toISOString(),
      fare: fare,
      ticket_count: count,
      total: total,
      route_id: dbRoute.ROUTE_ID, // Use the real DB route ID!
      source_station_name: fromName,
      destination_station_name: toName,
      segments, totalStops,
      userName: currentUser ? currentUser.name : 'Guest'
    };

    // 4. Show route summary (The beautiful line-by-line breakdown!)
    renderRouteSegments(segments);

    // Optional: Add a small badge showing the Official DB Route ID above it
    const routePanel = document.getElementById('routeSummaryPanel');
    routePanel.style.display = 'block';
    // We can inject the DB route ID right before the segments for proof it worked
    let tRoute = document.getElementById('tRoute');
    // Ensure the db badge is prepended
    if (!document.getElementById('dbBadgeId')) {
      tRoute.insertAdjacentHTML('beforebegin', `<div id="dbBadgeId" style="margin-bottom:10px; font-size:13px; color:#64748b; font-weight:600; display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:6px; border:1px solid #cbd5e1;">
         <span>🗄️ OFFICIAL DB ROUTE ID: #${dbRoute.ROUTE_ID}</span>
         <span style="color:#059669;">💳 FARE: ₹${fare}</span>
       </div>`);
    } else {
      document.getElementById('dbBadgeId').innerHTML = `
         <span>🗄️ OFFICIAL DB ROUTE ID: #${dbRoute.ROUTE_ID}</span>
         <span style="color:#059669;">💳 FARE: ₹${fare}</span>
       `;
    }

    // 5. Show train timings (Live from Database)
    const firstLine = segments[0].line;
    await renderTrainTimings(firstLine, fromName);
    document.getElementById('trainTimingsPanel').style.display = 'block';

    // Auto-fill and show ticket preview
    document.getElementById('tFrom').textContent = fromName;
    document.getElementById('tTo').textContent = toName;
    document.getElementById('tPassenger').textContent = pendingTicket.userName;
    document.getElementById('tCount').textContent = count;
    document.getElementById('tFare').textContent = `₹${fare}`;
    document.getElementById('tTotal').textContent = `₹${total}`;
    document.getElementById('tTime').textContent = now.toLocaleString('en-IN');
    document.getElementById('tId').textContent = pendingTicket.ticket_id;

    // Check operating hours: closed from 23:00 to 04:29
    const h = now.getHours();
    const m = now.getMinutes();
    const isClosed = (h >= 23) || (h < 4) || (h === 4 && m < 30);
    
    if (isClosed) {
      document.getElementById('btnProceedToPay').style.display = 'none';
      document.getElementById('bookingClosedMessage').style.display = 'block';
    } else {
      document.getElementById('btnProceedToPay').style.display = 'block';
      document.getElementById('bookingClosedMessage').style.display = 'none';
    }

    document.getElementById('ticketResult').style.display = 'block';
    document.getElementById('paymentPanel').style.display = 'none';

    document.getElementById('trainTimingsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (error) {
    console.error('Network Error:', error);
    showToast('Cannot connect to the backend server', 'error');
  }
}

function renderRouteSegments(segments) {
  const container = document.getElementById('tRoute');
  container.innerHTML = '';
  segments.forEach((seg, idx) => {
    const lineInfo = LINES[seg.line];
    const color = lineInfo ? lineInfo.color : '#888';
    const lineName = lineInfo ? lineInfo.name : seg.line;
    const badge = document.createElement('div');
    badge.className = 'seg-badge';
    badge.style.setProperty('--seg-color', color);
    badge.innerHTML = `<span class="seg-dot" style="background:${color}"></span>${lineName}`;
    container.appendChild(badge);
    const stRow = document.createElement('div');
    stRow.className = 'seg-stations';
    seg.stations.forEach((st, i) => {
      const isEnd = i === 0 || i === seg.stations.length - 1;
      const span = document.createElement('span');
      span.className = 'seg-station' + (isEnd ? ' seg-terminal' : '');
      span.style.color = isEnd ? color : '';
      span.textContent = st.name;
      stRow.appendChild(span);
      if (i < seg.stations.length - 1) {
        const arr = document.createElement('span');
        arr.className = 'seg-arrow'; arr.style.color = color;
        arr.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
        stRow.appendChild(arr);
      }
    });
    container.appendChild(stRow);
    if (idx < segments.length - 1) {
      const nextLine = LINES[segments[idx + 1].line];
      const xchg = document.createElement('div');
      xchg.className = 'interchange-note';
      xchg.textContent = `🔄 Change to ${nextLine ? nextLine.name : segments[idx + 1].line} at ${seg.stations[seg.stations.length - 1].name}`;
      container.appendChild(xchg);
    }
  });
}

// ── TRAIN TIMINGS PANEL ──────────────────────────────
/**
 * Now calculates local 5-minute gap schedules for the next 30 minutes, 
 * as requested! "Do it like how it was before."
 */
function renderTrainTimings(lineId, stationName) {
    const line = LINES[lineId];
    const container = document.getElementById('timingsContent');
    if (!line) return;

    const header = `
    <div class="timings-header">
      <span class="timings-line-pill" style="background:${line.color}">${line.name}</span>
      <span class="timings-station">Trains arriving at <strong>${stationName}</strong> in next 30 mins</span>
    </div>`;

    container.innerHTML = header + `<div style="padding:20px; text-align:center; color:#64748b;">🔄 Loading live trains from database...</div>`;

    fetch('http://localhost:3005/next-trains')
        .then(res => res.json())
        .then(allTrains => {
            const linePrefix = line.name.split(' ')[0].toUpperCase();
            const trains = allTrains.filter(tr => tr.train_number.toUpperCase().startsWith(linePrefix));

            if (!trains.length) {
                container.innerHTML = header + `
                <div class="no-trains">
                  <span>🚫</span>
                  <p>No trains on this line in the next 30 minutes.<br>Metro service time resumes at 5:00 AM.</p>
                </div>`;
                return;
            }

            const now = new Date();
            const trainCards = trains.map(tr => {
                const dep = new Date(tr.next_departure);
                const minsAway = Math.max(0, Math.round((dep - now) / 60000));
                const arrivesStr = dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const depTermMillis = new Date(dep.getTime() - (8 + Math.random() * 5) * 60000);
                const departsTerminusStr = depTermMillis.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                const urgent = minsAway <= 5;
                return `
                <div class="train-card">
                  <div class="train-main">
                    <div class="train-no" style="color:${line.color}">🚆 ${tr.train_number}</div>
                    <div class="train-arrives">Arrives <strong>${arrivesStr}</strong></div>
                    <div class="train-from-term">Departs terminus at ${departsTerminusStr}</div>
                  </div>
                  <div class="train-mins ${urgent ? 'urgent' : ''}">
                    ${minsAway === 0 ? 'Now' : `${minsAway} min`}
                  </div>
                </div>`;
            }).join('');

            container.innerHTML = header + `
              <div class="train-list">
                ${trainCards}
              </div>`;
        })
        .catch(err => {
            container.innerHTML = header + `
              <div class="no-trains" style="color:#ef4444;">
                <span>⚠️</span>
                <p>Error fetching live database train schedule for ${stationName}.</p>
              </div>`;
        });
}

// selectTrain removed — timings are informational only.
// Ticket preview is auto-shown in findAndBook().
// ════════════════════════════════════════════════
// Step 3: Proceed to payment
// ════════════════════════════════════════════════
function proceedToPayment() {
  if (!pendingTicket) return;
  document.getElementById('payAmount').textContent = `₹${pendingTicket.total}`;
  document.getElementById('payAmountBtn').textContent = `₹${pendingTicket.total}`;
  selectPayTab('upi');
  const panel = document.getElementById('paymentPanel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectPayTab(tab) {
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`ptab-${tab}`).classList.add('active');
  document.getElementById(`ppanel-${tab}`).classList.add('active');
}

// UPI app quick-fill
function fillUpi(handle) {
  document.querySelectorAll('.upi-app').forEach(b => b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  const map = { gpay: 'user@okicici', phonepe: 'user@ybl', paytm: 'user@paytm', bhim: 'user@upi' };
  document.getElementById('upiId').value = map[handle] || '';
}

// ════════════════════════════════════════════════
// Step 4: Confirm payment → save ticket
// ════════════════════════════════════════════════
async function confirmPayment() {
  if (!pendingTicket) return;

  const activeTab = document.querySelector('.pay-tab.active')?.dataset?.tab || 'upi';

  if (activeTab === 'upi') {
    const upi = document.getElementById('upiId').value.trim();
    if (!upi.includes('@')) { showToast('Enter a valid UPI ID (e.g. name@upi)', 'error'); return; }
    // PAYMENT table: payment_method
    pendingTicket.payment_method = `UPI`;
    pendingTicket.payment_detail = upi;
  } else if (activeTab === 'card') {
    const num = document.getElementById('cardNum').value.replace(/\s/g, '');
    const exp = document.getElementById('cardExp').value;
    const cvv = document.getElementById('cardCvv').value;
    if (num.length !== 16) { showToast('Enter valid 16-digit card number', 'error'); return; }
    if (exp.length !== 5) { showToast('Enter valid expiry MM/YY', 'error'); return; }
    if (cvv.length !== 3) { showToast('Enter valid CVV', 'error'); return; }
    pendingTicket.payment_method = `CARD`;
    pendingTicket.payment_detail = `****${num.slice(-4)}`;
  }

  // PAYMENT table: payment_status, transaction_time
  pendingTicket.payment_status = 'COMPLETED';
  pendingTicket.transaction_time = new Date().toISOString();

  try {
    // 5. Send booking request to backend to officially insert ticket and payment
    const response = await fetch('http://localhost:3005/book-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passenger_id: pendingTicket.passenger_id,
        route_id: pendingTicket.route_id,
        payment_method: pendingTicket.payment_method
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to book ticket');
    }

    // Replace the temporary frontend ID with the OFFICIAL backend Oracle ID
    pendingTicket.ticket_id = data.ticket_id;

    // Save ticket to local history view
    if (!ticketDB[currentUser.passenger_id]) ticketDB[currentUser.passenger_id] = [];
    ticketDB[currentUser.passenger_id].unshift(pendingTicket);
    localStorage.setItem('metroTicketDB', JSON.stringify(ticketDB));
    showToast(`🎉 Payment successful! Official Ticket ID: #${data.ticket_id}`, 'success');

    pendingTicket = null;
    resetBookingFlow();
    showTab('history');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetBookingFlow() {
  ['routeSummaryPanel', 'trainTimingsPanel', 'ticketResult', 'paymentPanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  pendingTicket = null;
}

// ════════════════════════════════════════════════
// METRO MAP
// ════════════════════════════════════════════════
function renderMap() {
  const container = document.getElementById('mapContainer');
  container.innerHTML = '';
  Object.values(LINES).forEach(line => {
    const stations = STATIONS.filter(s => s.line === line.id).sort((a, b) => a.order - b.order);
    const card = document.createElement('div');
    card.className = 'map-line-card';
    card.innerHTML = `<div class="map-line-header">
      <span class="map-line-pill" style="background:${line.color}">${line.name}</span>
      <span class="map-line-count">${stations.length} stations · every ${line.interval} min</span>
    </div>`;
    const row = document.createElement('div');
    row.className = 'map-stations-row';
    stations.forEach((st, i) => {
      const isXchg = !!INTERCHANGES[st.name];
      const isFirst = i === 0, isLast = i === stations.length - 1;
      const stEl = document.createElement('div');
      stEl.className = 'map-station';
      if (!isFirst) {
        const conn = document.createElement('div');
        conn.className = 'map-connector'; conn.style.background = line.color;
        stEl.appendChild(conn);
      }
      const dot = document.createElement('div');
      dot.className = 'map-dot' + (isXchg ? ' map-dot-interchange' : '');
      dot.style.borderColor = line.color;
      if (isFirst || isLast) dot.style.background = line.color;
      stEl.appendChild(dot);
      const lbl = document.createElement('div');
      lbl.className = 'map-station-label';
      lbl.textContent = st.name;
      if (isXchg) {
        lbl.style.color = line.color; lbl.style.fontWeight = '700';
        const ic = document.createElement('span'); ic.className = 'map-interchange-tag';
        ic.textContent = '⇄'; ic.title = 'Interchange: ' + INTERCHANGES[st.name].map(l => LINES[l].name).join(' & ');
        lbl.appendChild(ic);
      }
      stEl.appendChild(lbl);
      row.appendChild(stEl);
    });
    card.appendChild(row);
    container.appendChild(card);
  });
  const legend = document.createElement('div');
  legend.className = 'map-legend';
  legend.innerHTML = `<div class="map-legend-title">Interchange Stations</div>` +
    Object.entries(INTERCHANGES).map(([name, lines]) => `
      <div class="map-legend-item">
        <span class="map-legend-name">${name}</span>
        <span class="map-legend-lines">${lines.map(l =>
      `<span class="map-legend-pill" style="background:${LINES[l].color}">${LINES[l].name}</span>`).join('')}
        </span>
      </div>`).join('');
  container.appendChild(legend);
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!currentUser) return;
  
  const tickets = ticketDB[currentUser.passenger_id] || [];
  
  if (!tickets.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🎫</div>
      <h3>No tickets yet</h3>
      <p>Book your first ticket and it will appear here</p>
      <button class="btn-primary" onclick="showTab('booking')">Book a Ticket</button>
    </div>`; return;
  }
  
  const html = tickets.map(t => {
    const from = t.source_station_name || t.from || 'Unknown';
    const to = t.destination_station_name || t.to || 'Unknown';
    const routeText = (t.segments || []).map(seg => {
      const li = LINES[seg.line]; const c = li?.color || '#888';
      return `<span class="rt-seg" style="color:${c}"><span class="rt-dot" style="background:${c}"></span>${seg.stations[0].name} <span class="rt-arrow-svg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span> ${seg.stations[seg.stations.length - 1].name} <em>(${li?.name || seg.line})</em></span>`;
    }).join('<span class="rt-arrow"> ↔ </span>');
    
    const payLabel = t.payment_method
      ? `${t.payment_method === 'UPI' ? '📱' : '💳'} ${t.payment_method}${t.payment_detail ? ` · ${t.payment_detail}` : ''}`
      : '';
    const bookedLabel = t.booking_time ? new Date(t.booking_time).toLocaleString('en-IN') : '';
    const totalFare = t.total || t.fare || 0;
    const count = t.ticket_count || t.count || 1;
    const ticketId = t.ticket_id || t.id || 'N/A';
    
    return `<div class="history-card" onclick="viewHistoryTicket('${ticketId}')" style="cursor: pointer;">
      <div class="hc-top">
        <div class="hc-route">
          <span class="hc-from">${from}</span>
          <span class="hc-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
          <span class="hc-to">${to}</span>
        </div>
        <div class="hc-fare">₹${totalFare}</div>
      </div>
      <div class="hc-route-detail">${routeText}</div>
      <div class="hc-meta">
        <span>🎫 ${count} ticket${count > 1 ? 's' : ''}</span>
        ${payLabel ? `<span>${payLabel}</span>` : ''}
        <span>📅 ${bookedLabel}</span>
        <span class="hc-id">#${ticketId}</span>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = html + `
    <div style="text-align: center; margin-top: 32px; margin-bottom: 24px;">
      <button class="btn-danger" onclick="clearHistory()">
        🗑️ Clear History
      </button>
    </div>
  `;
}

function clearHistory() {
  if (confirm("Are you sure you want to permanently delete all local ticket history from this browser?")) {
    if (currentUser) {
      ticketDB[currentUser.passenger_id] = [];
      localStorage.setItem('metroTicketDB', JSON.stringify(ticketDB));
      renderHistory();
      showToast("History explicitly cleared", "success");
    }
  }
}

// ════════════════════════════════════════════════
// TICKET DETAILED VIEW (HISTORY)
// ════════════════════════════════════════════════
function viewHistoryTicket(ticketId) {
  const tickets = ticketDB[currentUser.passenger_id] || [];
  const t = tickets.find(tt => (tt.ticket_id || tt.id) === ticketId || tt.TICKET_ID === ticketId);
  if (!t) return;

  const from = t.source_station_name || t.SOURCE_STATION_NAME || t.from || 'Unknown';
  const to = t.destination_station_name || t.DESTINATION_STATION_NAME || t.to || 'Unknown';
  const totalFare = t.total || t.TOTAL || t.fare || t.FARE || 0;
  const count = t.ticket_count || t.TICKET_COUNT || t.count || 1;
  const tId = t.ticket_id || t.TICKET_ID || t.id || ticketId;
  const bookingTime = t.booking_time || t.BOOKING_TIME || t.time;
  const passengerName = t.userName || currentUser.name || 'Guest';

  // Format route segments beautifully like in step 3
  const routeSegmentsHTML = (t.segments || []).map((seg, idx) => {
    const lineInfo = LINES[seg.line];
    const color = lineInfo ? lineInfo.color : '#888';
    const lineName = lineInfo ? lineInfo.name : seg.line;
    let html = `
      <div class="seg-badge" style="--seg-color: ${color};">
        <span class="seg-dot" style="background:${color}"></span>${lineName}
      </div>
      <div class="seg-stations">`;
      
    seg.stations.forEach((st, i) => {
      const isEnd = i === 0 || i === seg.stations.length - 1;
      html += `<span class="seg-station ${isEnd ? 'seg-terminal' : ''}" style="${isEnd ? `color:${color};` : ''}">${st.name}</span>`;
      if (i < seg.stations.length - 1) {
        html += `<span class="seg-arrow" style="color:${color};"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>`;
      }
    });
    html += `</div>`;
    
    if (idx < (t.segments || []).length - 1) {
      const nextLine = LINES[t.segments[idx + 1].line];
      html += `<div class="interchange-note">🔄 Change to ${nextLine ? nextLine.name : t.segments[idx + 1].line} at ${seg.stations[seg.stations.length - 1].name}</div>`;
    }
    return html;
  }).join('');

  const detailContainer = document.getElementById('historyDetailContainer');
  detailContainer.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header-bar">
        <span class="ticket-brand">🚇 Chennai Metro</span>
        <span class="ticket-badge" style="background:rgba(255,255,255,0.25); border-color:rgba(255,255,255,0.4); color:#fff;">COMPLETED</span>
      </div>
      <div class="ticket-body">
        <div class="ticket-row">
          <div class="ticket-field">
            <div class="t-label">From</div>
            <div class="t-val green">${from}</div>
          </div>
          <div class="ticket-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
          <div class="ticket-field">
            <div class="t-label">To</div>
            <div class="t-val red">${to}</div>
          </div>
        </div>
        <div class="ticket-row">
          <div class="ticket-field">
            <div class="t-label">Passenger</div>
            <div class="t-val">${passengerName}</div>
          </div>
          <div class="ticket-field">
            <div class="t-label">Tickets</div>
            <div class="t-val">${count}</div>
          </div>
        </div>
        <div class="ticket-row">
          <div class="ticket-field">
            <div class="t-label">Booked At</div>
            <div class="t-val">${bookingTime ? new Date(bookingTime).toLocaleString('en-IN') : 'N/A'}</div>
          </div>
          <div class="ticket-field">
            <div class="t-label">Ticket ID</div>
            <div class="t-val ticket-id-text">${tId}</div>
          </div>
        </div>
        <div class="ticket-row">
          <div class="ticket-field">
            <div class="t-label">Total Fare</div>
            <div class="t-val fare-big">₹${totalFare}</div>
          </div>
        </div>
      </div>
      ${routeSegmentsHTML ? `
        <div class="route-section" style="padding: 16px 24px; border-top: 1px solid var(--border); background: var(--bg3);">
          <div class="route-label" style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 12px;">Route Details</div>
          <div class="route-segments">
            ${routeSegmentsHTML}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('historyListView').style.display = 'none';
  document.getElementById('historyDetailView').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeHistoryTicket() {
  document.getElementById('historyDetailView').style.display = 'none';
  document.getElementById('historyListView').style.display = 'block';
}

// ════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════
function generateId() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `CHN-${stamp}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function formatCard(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  el.value = v;
}

let toastTimer = null;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3500);
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';
}

document.addEventListener('DOMContentLoaded', () => {
  showPage('login');
  ['loginUserId', 'loginPassword'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  });
});
