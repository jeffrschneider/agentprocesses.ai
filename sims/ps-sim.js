/* =======================================================================
   Agent Processes - run simulation engine
   -----------------------------------------------------------------------
   A relative of agentworkpatterns' WPSim, one level of zoom up. The left
   column is the process document doing its job: phases light up as their
   after: lines are satisfied, records land where they belong, and the
   run-scoped lane fires on its own clock. The right panel shows the
   inside of whichever phase is active, in the same stage grammar as the
   simulations on agentcollab.dev and agentworkpatterns.com.

   A score names the phases, the run-scoped lanes, a set of scenes (one
   per pattern the run convenes), and an ordered list of steps:

     { phase, note, log, dur,            caption + transcript
       scene,                            switch the right panel to a scene
       say, to, k, wire,                 one message inside the scene
       set, move, prop, bump,            scene effects (land with the msg)
       sys,                              append a line to a system panel
       run:  { phaseId: state },         pending|active|done|failed|redo
       rec:  { ph, t, k },               a record chip under a phase
       lane: { laneId: { live, chip, close } },
       runOpen: true, runDone: true }

   Scene effects land when the message ARRIVES; column effects land with
   the step. Scrubbing replays from zero, so any step is a true state.
   ======================================================================= */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var SCORES = {};

  var VB = { w: 680, h: 404 };
  var BOX = { x0: 40, x1: 640, y0: 44, y1: 336 };
  var R = 23;
  var FLIGHT = 0.58;
  var DUR_MSG = 2600, DUR_BEAT = 2000;

  var KCOLOR = {
    broadcast: 'var(--broadcast)', direct: 'var(--address)',
    pen: 'var(--signal)', verdict: 'var(--verify)'
  };
  var KIND_COLOR = {
    chair: 'var(--chair)', pen: 'var(--pen)',
    peer: 'var(--peer)', object: 'var(--object)'
  };

  function at(p) {
    return { x: BOX.x0 + p[0] * (BOX.x1 - BOX.x0), y: BOX.y0 + p[1] * (BOX.y1 - BOX.y0) };
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function html(tag, cls, parent, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------------------------------------------------------------- */
  /* derived state: replay 0..i so scrubbing is always correct         */
  /* ---------------------------------------------------------------- */
  function sceneBase(scene) {
    var st = { nodes: {}, props: {}, sys: [] };
    (scene.cast || []).forEach(function (c) {
      st.nodes[c.id] = { s: c.s || 'idle', role: c.role, kind: c.kind, at: c.at.slice() };
    });
    (scene.props || []).forEach(function (p) {
      st.props[p.id] = {
        version: p.version, frozen: !!p.frozen, label: p.label,
        hidden: !!p.hidden, at: p.at.slice()
      };
    });
    return st;
  }

  function baseState(score) {
    var st = {
      scene: null, sc: { nodes: {}, props: {}, sys: [] },
      phases: {}, rounds: {}, recs: [], lanes: {},
      runOpen: false, runDone: false
    };
    score.phases.forEach(function (p) { st.phases[p.id] = 'pending'; });
    (score.lanes || []).forEach(function (l) {
      st.lanes[l.id] = { live: false, closed: false, chips: [] };
    });
    return st;
  }

  /* column effects: land with the step */
  function applyCol(score, st, step) {
    var k;
    if (step.scene && step.scene !== st.scene) {
      st.scene = step.scene;
      st.sc = sceneBase(score.scenes[step.scene] || {});
    }
    if (step.run) for (k in step.run) {
      var v = step.run[k];
      if (v === 'redo') { st.phases[k] = 'active'; st.rounds[k] = (st.rounds[k] || 1) + 1; }
      else st.phases[k] = v;
    }
    if (step.rec) (Array.isArray(step.rec) ? step.rec : [step.rec]).forEach(function (r) {
      st.recs.push(r);
    });
    if (step.lane) for (k in step.lane) {
      var L = st.lanes[k], op = step.lane[k];
      if (!L) continue;
      if (op.live != null) L.live = op.live;
      if (op.chip) L.chips.push(op.chip);
      if (op.close) { L.closed = true; L.live = false; if (op.close !== true) L.chips.push(op.close); }
    }
    if (step.runOpen) st.runOpen = true;
    if (step.runDone) st.runDone = true;
  }

  /* scene effects: land when the message lands */
  function applyScene(st, step) {
    var k;
    if (step.set) for (k in step.set) if (st.sc.nodes[k]) st.sc.nodes[k].s = step.set[k];
    if (step.role) for (k in step.role) if (st.sc.nodes[k]) st.sc.nodes[k].role = step.role[k];
    if (step.move) for (k in step.move) if (st.sc.nodes[k]) st.sc.nodes[k].at = step.move[k].slice();
    if (step.bump) for (k in step.bump) if (st.sc.props[k]) st.sc.props[k].version = step.bump[k];
    if (step.prop) for (k in step.prop) if (st.sc.props[k]) {
      var patch = step.prop[k];
      for (var kk in patch) st.sc.props[k][kk] = kk === 'at' ? patch[kk].slice() : patch[kk];
    }
    if (step.sys) st.sc.sys.push(step.sys);
  }

  function stateAt(score, idx, landed) {
    var st = baseState(score);
    for (var i = 0; i <= idx; i++) {
      var step = score.steps[i];
      if (i === idx) { applyCol(score, st, step); if (landed) applyScene(st, step); break; }
      applyCol(score, st, step);
      applyScene(st, step);
    }
    return st;
  }

  /* ---------------------------------------------------------------- */
  function Sim(host, score) {
    this.score = score;
    this.host = host;
    this.i = 0; this.t = 0; this.landed = false;
    this.playing = false; this.speed = 1; this.raf = null; this.last = 0;
    this.nodes = {}; this.props = {};
    this.curScene = undefined;
    this.reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.build();
    this.go(0, true);
  }

  Sim.prototype.build = function () {
    var S = this.score, self = this;
    this.host.className = 'acsim psim';
    this.host.style.setProperty('--hue', 'var(--' + (S.hue || 'address') + ')');
    this.host.setAttribute('tabindex', '0');
    this.host.innerHTML = '';

    /* header */
    var head = html('div', 'acsim-head', this.host);
    html('div', 'acsim-tag', head, S.shape || 'a process run');
    html('h3', 'acsim-name', head, S.title);
    html('p', 'acsim-line', head, S.blurb || '');
    if (S.doc) {
      var a = html('a', 'acsim-doc', head, S.docLabel || 'read the process ↗');
      a.href = S.doc; a.target = '_blank'; a.rel = 'noopener noreferrer';
    }

    /* body: run column + stage */
    var body = html('div', 'acsim-body', this.host);

    var run = html('div', 'ps-run', body);
    this.runBox = run;
    this.runHead = html('div', 'ps-runhead', run);
    this.runHead.innerHTML = '<b>' + S.runLabel + '</b>' + (S.runMeta || '');
    html('div', 'ps-col-h', run, 'phases');
    this.phEls = {};
    S.phases.forEach(function (p) {
      var el = html('div', 'ps-ph', run);
      el.setAttribute('data-s', 'pending');
      var top = html('div', 'ps-ph-top', el);
      html('span', 'n', top, p.name);
      el._round = html('span', 'r', top, '');
      html('div', 'k', el, p.kind);
      html('div', 'meta', el, p.meta || '');
      el._recs = html('div', 'ps-recs', el);
      self.phEls[p.id] = el;
    });
    this.laneEls = {};
    if (S.lanes && S.lanes.length) {
      var lanes = html('div', 'ps-lanes', run);
      html('div', 'ps-col-h', lanes, 'run-scoped');
      S.lanes.forEach(function (l) {
        var el = html('div', 'ps-lane', lanes);
        var top = html('div', 'ps-lane-top', el);
        html('span', 'ps-lamp', top, '');
        html('span', 'n', top, l.name);
        html('div', 'k', el, l.kind);
        el._recs = html('div', 'ps-recs', el);
        self.laneEls[l.id] = el;
      });
    }
    this.runDoneEl = html('div', 'ps-rundone', run);
    this.runDoneEl.innerHTML = '<b>' + (S.runDone && S.runDone.head || 'RUN DONE') + '</b>' +
      ((S.runDone && S.runDone.lines) || []).join('<br>');

    /* stage */
    var stage = html('div', 'acsim-stage', body);
    this.stage = stage;
    var root = svg('svg', {
      viewBox: '0 0 ' + VB.w + ' ' + VB.h, role: 'img',
      'aria-label': S.title + ' simulation'
    }, stage);
    this.svg = root;
    this.gRoom = svg('g', {}, root);
    this.gWave = svg('g', {}, root);
    this.gProp = svg('g', {}, root);
    this.gNode = svg('g', {}, root);
    this.gMsg = svg('g', {}, root);

    this.sysEl = html('div', 'ps-sys', stage);
    this.sysHead = html('div', 'ps-sys-h', this.sysEl, '');
    this.sysBody = html('div', '', this.sysEl);
    this.quietEl = html('div', 'ps-quiet', stage);
    this.quietSpan = html('span', '', this.quietEl, '');

    /* caption */
    var cap = html('div', 'acsim-cap', this.host);
    this.phaseEl = html('div', 'acsim-phase', cap);
    this.noteEl = html('p', 'acsim-note', cap);

    /* controls */
    var ctl = html('div', 'acsim-ctl', this.host);
    this.bBack = html('button', 'acsim-btn', ctl, '◀');
    this.bBack.title = 'previous step';
    this.bPlay = html('button', 'acsim-btn play', ctl, '▶');
    this.bPlay.title = 'play / pause';
    this.bFwd = html('button', 'acsim-btn', ctl, '▶▎');
    this.bFwd.title = 'next step';
    var scrub = html('div', 'acsim-scrub', ctl);
    this.ticks = S.steps.map(function (st, n) {
      var b = html('button', 'acsim-tick', scrub);
      b.title = (st.phase || '') + ' — ' + (st.log || st.wire || 'beat');
      b.addEventListener('click', function () { self.pause(); self.go(n, true); });
      return b;
    });
    this.bSpeed = html('button', 'acsim-btn', ctl, '1×');
    this.bSpeed.title = 'speed';
    this.countEl = html('span', 'acsim-count', ctl, '');

    /* transcript strip */
    var log = html('div', 'acsim-log', this.host);
    var logIn = html('div', 'acsim-log-in', log);
    html('div', 'acsim-log-h', logIn, 'transcript');
    this.logBox = logIn;
    this.logLines = S.steps.map(function (st) {
      var l = html('div', 'acsim-log-l', logIn);
      l.style.setProperty('--k', KCOLOR[st.k] || 'var(--dim)');
      var who = '·';
      if (st.say) {
        var scn = S.scenes[st.scene || ''] || {};
        var c = (self.castOfIn(st.say, st, S) || {});
        who = c.mono || '·';
      }
      html('span', 'acsim-log-w', l, who);
      var txt = st.log || st.wire || '';
      if (!st.say) txt = txt.replace(/^·\s*/, '');
      html('span', 'acsim-log-t', l, txt);
      return l;
    });

    this.bPlay.addEventListener('click', function () { self.toggle(); });
    this.bBack.addEventListener('click', function () { self.pause(); self.go(Math.max(0, self.i - 1), true); });
    this.bFwd.addEventListener('click', function () {
      self.pause();
      if (self.i >= S.steps.length - 1) self.go(0, true); else self.go(self.i + 1, true);
    });
    this.bSpeed.addEventListener('click', function () {
      self.speed = self.speed === 1 ? 1.75 : self.speed === 1.75 ? 0.55 : 1;
      self.bSpeed.textContent = (self.speed === 0.55 ? '0.5' : self.speed === 1.75 ? '1.75' : '1') + '×';
    });
    this.host.addEventListener('keydown', function (e) {
      if (e.key === ' ') { e.preventDefault(); self.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); self.pause(); self.go(Math.min(S.steps.length - 1, self.i + 1), true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.pause(); self.go(Math.max(0, self.i - 1), true); }
    });

    if (global.IntersectionObserver) {
      this.io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { if (!self.userPaused && !self.ended) self.play(); }
          else self.pause(true);
        });
      }, { threshold: 0.3 });
      this.io.observe(this.host);
    }
  };

  /* which scene a step's speaker lives in: the scene in effect at it */
  Sim.prototype.castOfIn = function (id, step, S) {
    var sc = step.scene;
    if (!sc) {
      var idx = S.steps.indexOf(step);
      for (var j = idx; j >= 0; j--) if (S.steps[j].scene) { sc = S.steps[j].scene; break; }
    }
    var scene = S.scenes[sc] || {};
    return (scene.cast || []).filter(function (c) { return c.id === id; })[0];
  };

  /* -- scene (re)build ------------------------------------------------- */
  Sim.prototype.setScene = function (sceneId) {
    if (sceneId === this.curScene) return;
    this.curScene = sceneId;
    var scene = this.score.scenes[sceneId] || {};
    var self = this;
    [this.gRoom, this.gProp, this.gNode, this.gMsg, this.gWave].forEach(function (g) {
      while (g.firstChild) g.removeChild(g.firstChild);
    });
    this.nodes = {}; this.props = {}; this.flights = null;

    var isPanel = scene.sysHead != null || scene.quiet != null;
    this.sysEl.classList.toggle('on', scene.sysHead != null);
    this.quietEl.classList.toggle('on', scene.quiet != null);
    if (scene.sysHead != null) this.sysHead.textContent = scene.sysHead;
    if (scene.quiet != null) this.quietSpan.textContent = scene.quiet;
    this.sysBody.innerHTML = '';
    this.sysCount = 0;
    if (isPanel) return;

    var rm = scene.roomBox || { x0: 20, y0: 20, x1: VB.w - 20, y1: VB.h - 20 };
    svg('rect', {
      class: 'acr-frame', x: rm.x0, y: rm.y0,
      width: rm.x1 - rm.x0, height: rm.y1 - rm.y0, rx: 10
    }, this.gRoom);
    svg('text', { class: 'acr-label', x: rm.x0 + 12, y: rm.y0 - 8 }, this.gRoom)
      .textContent = scene.room || '';
    if (scene.pattern) svg('text', { class: 'ps-pat', x: rm.x1 - 12, y: rm.y0 - 8 }, this.gRoom)
      .textContent = scene.pattern;

    (scene.props || []).forEach(function (p) { self.buildProp(p); });
    (scene.cast || []).forEach(function (c) { self.buildNode(c); });
  };

  Sim.prototype.buildNode = function (c) {
    var p = at(c.at);
    var g = svg('g', { class: 'acn', 'data-s': c.s || 'idle' }, this.gNode);
    g.style.setProperty('--c', KIND_COLOR[c.kind] || 'var(--peer)');
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    svg('circle', { class: 'acn-flash', cx: 0, cy: 0, r: R + 2 }, g);
    svg('circle', { class: 'acn-ring', cx: 0, cy: 0, r: R + 5 }, g);
    svg('circle', { class: 'acn-disc', cx: 0, cy: 0, r: R }, g);
    svg('text', { class: 'acn-mono', x: 0, y: 0 }, g).textContent = c.mono;
    svg('text', { class: 'acn-name', x: 0, y: R + 15 }, g).textContent = c.title;
    var role = svg('text', { class: 'acn-role', x: 0, y: R + 27 }, g);
    role.textContent = c.role || '';
    var bx = R - 4, by = -R + 3;
    var mark = function (cls) {
      return svg('g', { class: 'acn-badge ' + cls, 'aria-hidden': 'true' }, g);
    };
    svg('line', { x1: bx - 4, y1: by, x2: bx + 4, y2: by }, mark('mute'));
    var wk = mark('work');
    [-4, 0, 4].forEach(function (dx) { svg('circle', { cx: bx + dx, cy: by, r: 1.3 }, wk); });
    svg('path', { d: 'M' + (bx - 4) + ' ' + by + 'l3 3l5.5 -6.5' }, mark('done'));
    var fl = mark('fail');
    svg('line', { x1: bx - 4, y1: by - 4, x2: bx + 4, y2: by + 4 }, fl);
    svg('line', { x1: bx - 4, y1: by + 4, x2: bx + 4, y2: by - 4 }, fl);
    this.nodes[c.id] = { g: g, role: role, p: p };
  };

  Sim.prototype.buildProp = function (pr) {
    var p = at(pr.at);
    var g = svg('g', { class: 'acp' }, this.gProp);
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    var rec = { g: g, p: p };
    var W = pr.w || 138, H = 46;
    svg('rect', { class: 'acp-bump', x: -W / 2 - 5, y: -H / 2 - 5, width: W + 10, height: H + 10, rx: 10 }, g);
    svg('rect', { class: 'acp-box', x: -W / 2, y: -H / 2, width: W, height: H, rx: 8 }, g);
    svg('text', { class: 'acp-kind', x: -W / 2 + 11, y: -H / 2 + 15 }, g)
      .textContent = pr.kind || 'artifact';
    rec.label = svg('text', { class: 'acp-label', x: -W / 2 + 11, y: -H / 2 + 30 }, g);
    rec.label.textContent = pr.label || '';
    rec.ver = svg('text', { class: 'acp-ver', x: -W / 2 + 11, y: -H / 2 + 42 }, g);
    rec.frozen = svg('text', { class: 'acp-frozen', x: W / 2 - 11, y: -H / 2 + 15 }, g);
    rec.frozen.setAttribute('text-anchor', 'end');
    rec.frozen.textContent = 'FROZEN';
    this.props[pr.id] = rec;
  };

  /* -- paint: column + scene ------------------------------------------- */
  function fillChips(box, chips) {
    var have = box.childNodes.length;
    if (have > chips.length) { box.innerHTML = ''; have = 0; }
    for (var n = have; n < chips.length; n++) {
      var c = chips[n];
      var el = document.createElement('span');
      el.className = 'ps-rec ' + (c.k || '');
      el.textContent = c.t != null ? c.t : c;
      box.appendChild(el);
    }
  }

  Sim.prototype.paint = function (st, speaker) {
    var S = this.score, k;

    /* run column */
    this.runHead.classList.toggle('on', st.runOpen);
    for (k in this.phEls) {
      var el = this.phEls[k];
      el.setAttribute('data-s', st.phases[k]);
      var rd = st.rounds[k];
      el._round.textContent = rd > 1 ? 'round ' + rd : '';
      el._round.classList.toggle('on', rd > 1);
      fillChips(el._recs, st.recs.filter(function (r) { return r.ph === k; }));
    }
    for (k in this.laneEls) {
      var le = this.laneEls[k], ls = st.lanes[k];
      le.classList.toggle('live', ls.live);
      le.classList.toggle('closed', ls.closed);
      fillChips(le._recs, ls.chips.map(function (c) { return { t: c, k: 'sys' }; }));
    }
    this.runDoneEl.classList.toggle('on', st.runDone);

    /* scene */
    this.setScene(st.scene);
    for (k in this.nodes) {
      var n = this.nodes[k], s = st.sc.nodes[k];
      if (!s) continue;
      n.g.setAttribute('data-s', (speaker === k && s.s !== 'out' && s.s !== 'muted') ? 'speaking' : s.s);
      if (n.role.textContent !== (s.role || '')) n.role.textContent = s.role || '';
      n.g.style.setProperty('--c', KIND_COLOR[s.kind] || 'var(--peer)');
      var np = at(s.at);
      if (np.x !== n.p.x || np.y !== n.p.y) {
        n.g.setAttribute('transform', 'translate(' + np.x + ',' + np.y + ')');
        n.p = np;
      }
    }
    for (k in this.props) {
      var P = this.props[k], sp = st.sc.props[k];
      if (!sp) continue;
      P.g.setAttribute('data-frozen', sp.frozen ? '1' : '0');
      P.g.style.opacity = sp.hidden ? 0 : 1;
      if (P.label) P.label.textContent = sp.label || '';
      if (P.ver) P.ver.textContent = !sp.version ? ''
        : /\s/.test(sp.version) ? sp.version : '@ ' + sp.version;
      var pp = at(sp.at);
      if (pp.x !== P.p.x || pp.y !== P.p.y) {
        P.g.setAttribute('transform', 'translate(' + pp.x + ',' + pp.y + ')');
        P.p = pp;
      }
    }
    /* system lines */
    if (this.sysCount == null) this.sysCount = 0;
    if (this.sysCount > st.sc.sys.length) { this.sysBody.innerHTML = ''; this.sysCount = 0; }
    for (var n2 = this.sysCount; n2 < st.sc.sys.length; n2++)
      html('div', 'ps-sys-l', this.sysBody, st.sc.sys[n2]);
    this.sysCount = st.sc.sys.length;
  };

  /* -- message flight (scene-local) ------------------------------------ */
  Sim.prototype.anchor = function (id) {
    if (id && typeof id === 'object' && id.at) return at(id.at);
    if (id === 'room') return { x: (BOX.x0 + BOX.x1) / 2, y: (BOX.y0 + BOX.y1) / 2 };
    if (this.nodes[id]) return this.nodes[id].p;
    if (this.props[id]) return this.props[id].p;
    return { x: VB.w / 2, y: VB.h / 2 };
  };

  Sim.prototype.spawnMsg = function (step) {
    while (this.gMsg.firstChild) this.gMsg.removeChild(this.gMsg.firstChild);
    this.flights = [];
    if (!step.say || !step.wire) return;
    var from = this.anchor(step.say);
    var tos = Array.isArray(step.to) ? step.to : [step.to || 'room'];
    var col = KCOLOR[step.k] || 'var(--address)';
    var self = this;
    tos.forEach(function (tid, n) {
      var to = self.anchor(tid);
      var g = svg('g', { class: 'acm' }, self.gMsg);
      g.style.setProperty('--k', col);
      var rect = svg('rect', { class: 'acm-pill', x: 0, y: -9, height: 18, rx: 9 }, g);
      var txt = svg('text', { class: 'acm-text', x: 0, y: 0 }, g);
      txt.textContent = step.wire;
      var w = 0;
      try { w = txt.getComputedTextLength(); } catch (e) { }
      if (!w) w = step.wire.length * 5.5;
      w = Math.max(46, w + 20);
      rect.setAttribute('x', -w / 2); rect.setAttribute('width', w);
      var dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
      var lift = Math.min(46, len * 0.19) * (n % 2 ? -1 : 1);
      var ctrl = { x: (from.x + to.x) / 2 - dy / len * lift, y: (from.y + to.y) / 2 + dx / len * lift };
      g.setAttribute('transform', 'translate(' + from.x + ',' + from.y + ')');
      g.style.opacity = 0;
      self.flights.push({ g: g, from: from, to: to, ctrl: ctrl, target: tid });
    });
    if (step.k === 'broadcast') {
      var wv = svg('circle', { class: 'acm-wave', cx: from.x, cy: from.y, r: 16 }, this.gWave);
      if (!this.reduced) {
        wv.classList.add('on');
        setTimeout(function () { if (wv.parentNode) wv.parentNode.removeChild(wv); }, 1200);
      } else if (wv.parentNode) wv.parentNode.removeChild(wv);
    }
  };

  Sim.prototype.moveMsg = function (p) {
    if (!this.flights) return;
    var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    this.flights.forEach(function (f) {
      var u = 1 - e;
      var x = u * u * f.from.x + 2 * u * e * f.ctrl.x + e * e * f.to.x;
      var y = u * u * f.from.y + 2 * u * e * f.ctrl.y + e * e * f.to.y;
      f.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
      f.g.style.opacity = p < 0.06 ? (p / 0.06).toFixed(2) : p > 0.93 ? ((1 - p) / 0.07).toFixed(2) : 1;
    });
  };

  /* -- step machinery ---------------------------------------------------- */
  Sim.prototype.durOf = function (step) {
    return (step.dur || (step.wire ? DUR_MSG : DUR_BEAT));
  };

  Sim.prototype.go = function (i, land) {
    var S = this.score;
    this.i = Math.max(0, Math.min(S.steps.length - 1, i));
    this.ended = false;
    var step = S.steps[this.i];
    this.t = land ? this.durOf(step) * 0.99 : 0;
    this.landed = !!land;

    this.phaseEl.textContent = step.phase || '';
    this.noteEl.innerHTML = step.note || '';
    this.countEl.textContent = (this.i + 1) + '/' + S.steps.length;
    this.bBack.disabled = this.i === 0;

    var self = this;
    this.ticks.forEach(function (b, n) {
      b.classList.toggle('seen', n < self.i);
      b.classList.toggle('now', n === self.i);
    });
    this.logLines.forEach(function (l, n) {
      var shown = n < self.i || (n === self.i && self.landed);
      l.classList.toggle('in', shown);
      l.classList.toggle('now', n === self.i && shown);
    });
    if (this.landed) this.scrollLog();

    if (land) {
      while (this.gMsg.firstChild) this.gMsg.removeChild(this.gMsg.firstChild);
      this.flights = null;
      var st = stateAt(S, this.i, true);
      this.paint(st, null);
      this.followRun(st, step);
    } else {
      var st2 = stateAt(S, this.i, false);
      this.paint(st2, step.say);
      this.spawnMsg(step);
      this.moveMsg(0);
      this.followRun(st2, step);
    }
  };

  /* keep whatever just changed in the run column on screen */
  Sim.prototype.followRun = function (st, step) {
    var el = null, k;
    if (st.runDone) el = this.runDoneEl;
    if (!el && step.lane) {
      var ids = Object.keys(step.lane);
      if (ids.length) el = this.laneEls[ids[ids.length - 1]];
    }
    if (!el) for (k in this.phEls) {
      if (st.phases[k] === 'active' || st.phases[k] === 'failed') el = this.phEls[k];
    }
    if (!el) el = this.runHead;
    var box = this.runBox;
    var top = box.scrollTop + (el.getBoundingClientRect().top -
      box.getBoundingClientRect().top) - box.clientHeight * 0.3;
    box.scrollTo ? box.scrollTo({ top: top, behavior: 'smooth' }) : (box.scrollTop = top);
  };

  Sim.prototype.land = function () {
    if (this.landed) return;
    this.landed = true;
    var S = this.score, step = S.steps[this.i], self = this;
    this.paint(stateAt(S, this.i, true), step.say);

    var l = this.logLines[this.i];
    l.classList.add('in', 'now');
    this.scrollLog();

    var hits = [];
    var tos = Array.isArray(step.to) ? step.to : [step.to || 'room'];
    if (step.say && step.wire && tos.length === 1 && tos[0] === 'room') {
      for (var id in this.nodes) {
        if (id !== step.say) {
          var ns = stateAt(S, self.i, true).sc.nodes[id];
          if (ns && ns.s !== 'out') hits.push(id);
        }
      }
    } else tos.forEach(function (t) { if (typeof t === 'string' && self.nodes[t]) hits.push(t); });
    hits.forEach(function (id) {
      var g = self.nodes[id].g;
      g.classList.remove('hit'); void g.offsetWidth; g.classList.add('hit');
      setTimeout(function () { g.classList.remove('hit'); }, 850);
    });

    if (step.bump) Object.keys(step.bump).forEach(function (pid) {
      var P = self.props[pid]; if (!P) return;
      P.g.classList.remove('bumped'); void P.g.getBBox; P.g.classList.add('bumped');
      setTimeout(function () { P.g.classList.remove('bumped'); }, 950);
    });

    if (step.lane) Object.keys(step.lane).forEach(function (lid) {
      var le = self.laneEls[lid]; if (!le || !step.lane[lid].chip) return;
      le.classList.remove('pulse'); void le.offsetWidth; le.classList.add('pulse');
      setTimeout(function () { le.classList.remove('pulse'); }, 1100);
    });
  };

  Sim.prototype.scrollLog = function () {
    var l = this.logLines[this.i];
    if (!l) return;
    var box = this.logBox;
    var top = l.offsetTop - box.clientHeight * 0.55;
    box.scrollTo ? box.scrollTo({ top: top, behavior: 'smooth' }) : (box.scrollTop = top);
  };

  Sim.prototype.tick = function (ts) {
    if (!this.playing) return;
    var dt = this.last ? ts - this.last : 16;
    this.last = ts;
    if (dt > 240) dt = 240;
    this.t += dt * this.speed;

    var step = this.score.steps[this.i], dur = this.durOf(step);
    var landAt = step.wire ? FLIGHT : 0.24;
    var p = Math.min(1, this.t / dur);

    if (step.wire) this.moveMsg(Math.min(1, p / landAt));
    if (p >= landAt) this.land();

    if (p >= 1) {
      if (this.i >= this.score.steps.length - 1) { this.finish(); return; }
      this.go(this.i + 1, false);
    }
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };

  Sim.prototype.play = function () {
    if (this.playing) return;
    var atEnd = this.ended || (this.i >= this.score.steps.length - 1 && this.landed);
    if (atEnd) { this.ended = false; this.go(0, false); }
    this.playing = true; this.userPaused = false; this.last = 0;
    this.bPlay.textContent = '‖';
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  Sim.prototype.pause = function (auto) {
    this.playing = false;
    if (!auto) this.userPaused = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.bPlay.textContent = this.ended ? '↺' : '▶';
  };
  Sim.prototype.toggle = function () { this.playing ? this.pause() : this.play(); };
  Sim.prototype.finish = function () {
    this.playing = false; this.ended = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.bPlay.textContent = '↺';
  };

  /* ---------------------------------------------------------------- */
  var PSim = {
    register: function (id, score) { score.id = id; SCORES[id] = score; return score; },
    scores: SCORES,
    get: function (id) { return SCORES[id]; },
    mount: function (host, id) {
      var s = SCORES[id];
      if (!s) { host.textContent = 'No score registered for "' + id + '".'; return null; }
      return new Sim(host, s);
    },
    mountAll: function (root) {
      var out = [];
      (root || document).querySelectorAll('[data-psim]').forEach(function (el) {
        out.push(PSim.mount(el, el.getAttribute('data-psim')));
      });
      return out;
    }
  };

  global.PSim = PSim;
})(window);
