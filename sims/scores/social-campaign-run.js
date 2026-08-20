/* Run 47 of mkt/social-campaign, from trigger to close.
   The left column is the process document; the right panel is the inside
   of whichever phase is active. Scene grammar and colors are the same as
   the simulations on agentcollab.dev and agentworkpatterns.com. */
PSim.register('social-campaign-run', {
  title: 'Run 47, from trigger to close',
  shape: 'mkt/social-campaign · one run',
  hue: 'address',
  blurb: 'The left column is the process document doing its job: phases light ' +
    'up when their after: lines are satisfied, records land as they are ' +
    'produced, and the run-scoped lane fires on its own clock. The right side ' +
    'shows the inside of whichever phase is active, in the same language as ' +
    'the simulations on agentcollab.dev and agentworkpatterns.com.',
  doc: 'https://github.com/jeffrschneider/agentprocesses/blob/main/examples/social-campaign.md',
  docLabel: 'read the process ↗',

  runLabel: 'RUN: mkt/social-campaign v4 · run 47',
  runMeta: 'started 2026-08-03 · trigger: brief CB-118',
  runDone: {
    head: 'RUN DONE · completed',
    lines: ['result: 14 assets live · 4 channels',
            'open: the response-time claim,', 'with Legal']
  },

  phases: [
    { id: 'direction', name: 'direction', kind: 'convenes bake-off',
      meta: 'after: trigger · by: 2 days · supervised' },
    { id: 'produce', name: 'produce', kind: 'runs build-by-talent',
      meta: 'after: direction · by: 5 days · supervised' },
    { id: 'claims', name: 'claims', kind: 'convenes assessment',
      meta: 'after: produce · by: 1 day · autonomous' },
    { id: 'legal', name: 'legal', kind: 'convenes approval',
      meta: 'after: claims · by: 1 day · never' },
    { id: 'schedule', name: 'schedule', kind: 'system: the scheduler',
      meta: 'after: legal · autonomous' },
    { id: 'readout', name: 'readout', kind: 'runs collect-and-report',
      meta: 'after: schedule + 14 days · autonomous' }
  ],

  lanes: [
    { id: 'status', name: 'status', kind: 'collect-and-report · every 7 days' },
    { id: 'spend', name: 'spend', kind: 'allocate-and-reconcile · from trigger' },
    { id: 'community', name: 'community', kind: 'human: field replies · on: a reply' }
  ],

  scenes: {
    trigger: { quiet: 'a campaign brief is approved · a run opens' },
    flight: { quiet: 'the campaign is live · no phase is active' },
    close: { quiet: 'every phase closed · every lane closed' },
    sched: { sysHead: 'system: the scheduler' },

    bakeoff: {
      room: 'direction · one room', pattern: 'bake-off · agent collab',
      cast: [
        { id: 'hs', title: 'Head of Social', mono: 'HS', role: 'owns the decision', kind: 'chair', at: [0.5, 0.16] },
        { id: 'ca', title: 'Concept agent A', mono: 'CA', role: 'one concept', kind: 'peer', at: [0.24, 0.62] },
        { id: 'cb', title: 'Concept agent B', mono: 'CB', role: 'one concept', kind: 'peer', at: [0.76, 0.62] }
      ],
      props: [
        { id: 'bf', kind: 'artifact', label: 'campaign brief CB-118', at: [0.5, 0.95], w: 190 }
      ]
    },

    bbt: {
      room: 'produce · a sub-job', pattern: 'build-by-talent · work pattern',
      cast: [
        { id: 'cl', title: 'Creative Lead', mono: 'CL', role: 'cuts the slices', kind: 'chair', at: [0.5, 0.14] },
        { id: 'cp', title: 'Copy agent', mono: 'CP', role: 'copy', kind: 'peer', at: [0.2, 0.6] },
        { id: 'ds', title: 'Design agent', mono: 'DS', role: 'design', kind: 'peer', at: [0.5, 0.6] },
        { id: 'vd', title: 'Video agent', mono: 'VD', role: 'video', kind: 'peer', at: [0.8, 0.6] }
      ],
      props: [
        { id: 'as', kind: 'artifact', label: 'the assets', hidden: true, at: [0.5, 0.97], w: 150 }
      ]
    },

    assess: {
      room: 'claims · one room', pattern: 'assessment · agent collab',
      cast: [
        { id: 'br', title: 'Brand agent', mono: 'BR', role: 'scores the claims', kind: 'pen', at: [0.26, 0.42] }
      ],
      props: [
        { id: 'rg', kind: 'register', label: 'claims register', version: 'v12', frozen: true, at: [0.72, 0.22], w: 170 },
        { id: 'as2', kind: 'artifact', label: 'the assets', version: 'v1', at: [0.72, 0.68], w: 170 }
      ]
    },

    approval: {
      room: 'legal · one room', pattern: 'approval · agent collab',
      cast: [
        { id: 'lg', title: 'Legal reviewer', mono: 'LG', role: 'a person, never automated', kind: 'pen', at: [0.28, 0.42] }
      ],
      props: [
        { id: 'as3', kind: 'artifact', label: 'the assets', version: 'v1', at: [0.72, 0.42], w: 170 }
      ]
    },

    bbt2: {
      room: 'produce · round 2', pattern: 'build-by-talent · work pattern',
      cast: [
        { id: 'cl2', title: 'Creative Lead', mono: 'CL', role: 'reopens one slice', kind: 'chair', at: [0.28, 0.26] },
        { id: 'cp2', title: 'Copy agent', mono: 'CP', role: 'revises the copy', kind: 'peer', at: [0.72, 0.55] }
      ],
      props: [
        { id: 'as4', kind: 'artifact', label: 'the assets', version: 'v1', at: [0.28, 0.82], w: 150 }
      ]
    },

    car: {
      room: 'readout · a sub-job', pattern: 'collect-and-report · work pattern',
      cast: [
        { id: 'an', title: 'Analytics agent', mono: 'AN', role: 'asks and merges', kind: 'pen', at: [0.5, 0.16] },
        { id: 'c1', title: 'Social channel', mono: 'SC', role: 'reports numbers', kind: 'peer', at: [0.2, 0.62] },
        { id: 'c2', title: 'Search channel', mono: 'SE', role: 'reports numbers', kind: 'peer', at: [0.5, 0.62] },
        { id: 'c3', title: 'Email channel', mono: 'EM', role: 'reports numbers', kind: 'peer', at: [0.8, 0.62] }
      ]
    }
  },

  steps: [
    { phase: 'The trigger', scene: 'trigger', dur: 5600,
      runOpen: true,
      lane: { spend: { live: true, chip: 'allocated: 3 lines' } },
      log: '· trigger: brief CB-118 approved · the RUN record opens',
      note: 'A campaign brief is approved in campaign-planning, which is this ' +
        'process\'s trigger. A run opens and its RUN record is written. The spend ' +
        'line attaches to the run at once: allocate-and-reconcile posts the budget ' +
        'as three lines before anything is spent.' },

    { phase: 'direction — convenes bake-off', scene: 'bakeoff',
      run: { direction: 'active' },
      say: 'hs', to: 'room', k: 'broadcast', wire: 'two concepts, please',
      set: { ca: 'working', cb: 'working' },
      log: 'the brief is posted · two concepts, please',
      note: 'The first phase is a single room running agentcollab\'s bake-off. ' +
        'The Head of Social posts the brief and commissions two concepts that do ' +
        'not exist yet, which is why this phase is a bake-off rather than ' +
        'evaluate-options.' },

    { say: 'ca', to: 'hs', k: 'pen', wire: 'concept A', set: { ca: 'done' },
      phase: 'direction — convenes bake-off',
      log: 'delivers concept A',
      note: 'Each concept is built privately and delivered to the owner. The ' +
        'makers never see each other\'s entries before the verdict.' },

    { say: 'cb', to: 'hs', k: 'pen', wire: 'concept B', set: { cb: 'done' },
      phase: 'direction — convenes bake-off',
      log: 'delivers concept B',
      note: 'Both entries are in. The owner judges them against the brief.' },

    { say: 'hs', to: 'room', k: 'verdict', wire: 'concept B wins',
      phase: 'direction — convenes bake-off',
      log: 'concept B wins',
      note: 'The verdict closes the room. The handoff line in the process says ' +
        'what crosses to produce: the winning concept and the channel list, with ' +
        'the verdicts it won on.' },

    { phase: 'produce — runs build-by-talent', scene: 'bbt',
      run: { direction: 'done', produce: 'active' },
      rec: { ph: 'direction', t: 'DONE · bake-off', k: 'done' },
      lane: { status: { live: true } },
      say: 'cl', to: 'room', k: 'broadcast', wire: 'three slices, seams named',
      set: { cp: 'working', ds: 'working', vd: 'working' },
      log: 'three slices, seams named · produce opens',
      note: 'produce is a whole sub-job: it runs the build-by-talent work ' +
        'pattern, with its own plan and its own close. The status line also goes ' +
        'live now, because the process says weekly reporting starts with ' +
        'production.' },

    { phase: 'produce — runs build-by-talent', dur: 3600,
      lane: { status: { chip: 'week 1 report' } },
      log: '· the specialists build in their slices · status files week 1',
      note: 'The specialists build inside their slices while the seams hold. ' +
        'Meanwhile the status line files its first weekly report — a run-scoped ' +
        'line firing while a phase is mid-flight, which no after: edge could ' +
        'describe.' },

    { say: 'cl', to: 'as', k: 'pen', wire: 'integrated: 15 assets',
      phase: 'produce — runs build-by-talent',
      prop: { as: { hidden: false, version: 'v1' } },
      set: { cp: 'done', ds: 'done', vd: 'done' },
      log: 'integrated · 15 assets at v1',
      note: 'The slices integrate into fifteen assets. The process only ever ' +
        'sees this sub-job\'s output and its JOB DONE record; it never reaches ' +
        'inside.' },

    { phase: 'claims — convenes assessment', scene: 'assess',
      run: { produce: 'done', claims: 'active' },
      rec: { ph: 'produce', t: 'JOB DONE', k: 'job' },
      say: 'br', to: 'as2', k: 'verdict', wire: 'scored: 14 pass · 1 fail',
      log: 'scored against the register · 14 pass, 1 fail',
      note: 'claims is autonomous: an agent scores every claim against the ' +
        'register at its version, and nobody reviews the scoring — the record is ' +
        'the check. One claim, about response times, has no citation.' },

    { phase: 'legal — convenes approval', scene: 'approval',
      run: { claims: 'done', legal: 'active' },
      rec: { ph: 'claims', t: 'DONE · 1 fail', k: 'done' },
      say: 'lg', to: 'room', k: 'verdict', wire: 'REDLINE · response-time claim',
      log: 'REDLINE — the response-time claim',
      note: 'legal is marked never: a person signs or refuses no matter how good ' +
        'the agents get, and only reads what failed the claims check. The ' +
        'reviewer refuses.' },

    { phase: 'The failure edge', dur: 3600,
      run: { legal: 'failed' }, set: { lg: 'failed' },
      rec: { ph: 'legal', t: 'REDLINE', k: 'fail' },
      log: '· a gate refused · the process names where the run goes',
      note: 'A refused gate is a process-level failure edge, and the document ' +
        'already says where the run goes: back to produce rather than back to ' +
        'the start. The direction was never the problem.' },

    { phase: 'produce — round 2', scene: 'bbt2',
      run: { produce: 'redo' },
      say: 'cl2', to: 'cp2', k: 'direct', wire: 'fix the response-time line',
      set: { cp2: 'working' },
      log: 'reopen the copy slice only',
      note: 'The pointer climbs back up the column. Only the copy slice ' +
        'reopens; design and video stay closed, because the failure edge names ' +
        'what it needs rather than rerunning everything.' },

    { say: 'cp2', to: 'cl2', k: 'pen', wire: 'copy v2',
      phase: 'produce — round 2',
      bump: { as4: 'v2' }, set: { cp2: 'done' },
      log: 'copy v2 · the assets move to v2',
      note: 'The revised copy lands and the assets move to version 2. Round two ' +
        'gets its own JOB DONE; nobody overwrites round one, because the records ' +
        'are the run\'s history.' },

    { phase: 'claims — again', scene: 'assess',
      run: { produce: 'done', claims: 'redo' },
      rec: { ph: 'produce', t: 'JOB DONE · round 2', k: 'job' },
      prop: { as2: { version: 'v2' } },
      say: 'br', to: 'as2', k: 'verdict', wire: 'scored: 14 pass · 1 held back',
      log: '14 pass · the response-time claim is held back',
      note: 'The claim still has no citation in the register, so its asset is ' +
        'held back and the other fourteen go on. This is the run\'s open: line ' +
        'being born.' },

    { phase: 'legal — again', scene: 'approval',
      run: { claims: 'done', legal: 'redo' },
      rec: { ph: 'claims', t: 'DONE · 1 held back', k: 'done' },
      prop: { as3: { version: 'v2' } },
      say: 'lg', to: 'room', k: 'verdict', wire: 'APPROVED · 14 assets @v2',
      log: 'approved · signed against v2',
      note: 'The approval is signed against version 2 of the assets. If anything ' +
        'changes after this, the approval is void and legal runs again — the ' +
        'policy line with no minor-change path.' },

    { phase: 'schedule — system:', scene: 'sched', dur: 3800,
      run: { legal: 'done', schedule: 'active' },
      rec: { ph: 'legal', t: 'DONE · approval', k: 'done' },
      lane: { community: { live: true } },
      sys: 'scheduler: 14 assets queued · 4 channels',
      log: '· system: the scheduler queues 14 assets',
      note: 'Nobody collaborates in this phase. A system acts and leaves one ' +
        'line saying what happened and when, which is the whole record. The ' +
        'community line arms now: replies can arrive once posts are public.' },

    { dur: 3000, sys: 'first post live · 2026-08-11 09:00',
      phase: 'schedule — system:',
      log: '· first post live 2026-08-11 09:00',
      note: 'The posts go out on the calendar the plan named.' },

    { phase: 'In flight', scene: 'flight', dur: 3600,
      run: { schedule: 'done' },
      rec: { ph: 'schedule', t: 'system: posted', k: 'sys' },
      lane: { status: { chip: 'week 2 report' } },
      log: '· no phase is active · the run-scoped lane keeps moving',
      note: 'For fourteen days no phase is active, and the run is not idle: ' +
        'the run-scoped lines are the only thing moving. The status line files ' +
        'week 2.' },

    { phase: 'In flight', dur: 3400,
      lane: { community: { chip: 'reply fielded · day 3' },
              spend: { chip: 'pacing: on plan' } },
      log: '· community fields a reply · spend reports on-plan pacing',
      note: 'A reply arrives and the community line fields it. The spend line ' +
        'reports pacing against the allocation. Neither of these belongs to any ' +
        'phase, which is why the document carries them as run-scoped.' },

    { phase: 'readout — runs collect-and-report', scene: 'car',
      run: { readout: 'active' },
      say: 'an', to: 'room', k: 'broadcast', wire: 'one question, every channel',
      set: { c1: 'working', c2: 'working', c3: 'working' },
      log: 'one question to every channel',
      note: 'readout starts fourteen days after schedule — a clock, so the ' +
        'after: line names a delay rather than a phase. It runs ' +
        'collect-and-report: one question, every named reporter accounted for.' },

    { dur: 3000, phase: 'readout — runs collect-and-report',
      set: { c1: 'done', c2: 'done', c3: 'done' },
      log: '· every channel answers · every line stays attributed',
      note: 'The answers come back and every line of the report stays ' +
        'attributed to the channel that reported it.' },

    { say: 'an', to: 'room', k: 'pen', wire: 'the readout, delivered',
      phase: 'readout — runs collect-and-report',
      log: 'the readout, delivered',
      note: 'The report ships on schedule. Its JOB DONE is the last phase ' +
        'record of the run.' },

    { phase: 'The lanes close', scene: 'close', dur: 4200,
      run: { readout: 'done' },
      rec: { ph: 'readout', t: 'JOB DONE', k: 'job' },
      lane: { spend: { close: 'reconciled · lines matched' },
              status: { close: true }, community: { close: true } },
      log: '· spend reconciles · every run-scoped line closes',
      note: 'The spend line reconciles even though nothing went wrong — the ' +
        'books close because the run closes. A run is not complete until every ' +
        'run-scoped line has closed too.' },

    { phase: 'RUN DONE', dur: 7000,
      runDone: true,
      log: '· RUN DONE: completed · one item stays open',
      note: 'The closing record names the outcome, the result, and what stays ' +
        'open: the response-time claim, sitting with Legal. Every record in the ' +
        'column was written while the work happened, so nobody has to ' +
        'reconstruct this run afterwards.' }
  ]
});
