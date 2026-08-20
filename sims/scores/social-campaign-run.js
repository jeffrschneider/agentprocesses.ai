/* One run of the social campaign, following the thirteen activities in
   the diagram above the simulation. The left column lists the activities
   by name and description; the right panel shows the people doing
   whichever activity is active. */
PSim.register('social-campaign-run', {
  title: 'One run of the social campaign',
  shape: 'the simulation',
  hue: 'address',
  blurb: 'The activities are on the left, the people doing the active one are ' +
    'on the right, and the record of the run builds up as it goes.',
  doc: 'https://github.com/jeffrschneider/agentprocesses/blob/main/examples/social-campaign.md',
  docLabel: 'read the process ↗',

  colHead: 'activities',
  runLabel: 'The Social Campaign Process',
  runMeta: 'one run · campaign brief CB-118',
  runDone: {
    head: 'the campaign is closed',
    lines: ['reported against the brief', 'learnings recorded for the next one']
  },

  phases: [
    { id: 'a1', name: '1. take in the brief',
      kind: 'work out what it must accomplish', meta: 'manager' },
    { id: 'a2', name: '2. set the parameters',
      kind: 'platforms, audience, dates, budget', meta: 'manager · leadership' },
    { id: 'a3', name: '3. brief the creatives',
      kind: 'say what is needed and by when', meta: 'manager · creative team' },
    { id: 'a4', name: '4. settle on a direction',
      kind: 'weigh concepts until one is worth backing', meta: 'manager · creative team' },
    { id: 'a5', name: '5. produce the posts',
      kind: 'copy, images, video, sized per platform', meta: 'copywriter · designer · video editor' },
    { id: 'a6', name: '6. get sign-offs',
      kind: 'brand and legal approve the material', meta: 'manager · brand · legal' },
    { id: 'a7', name: '7. set up the practical side',
      kind: 'tracking, landing pages, ad setup, schedule', meta: 'manager · media buyer · web team' },
    { id: 'a8', name: '8. launch',
      kind: 'posts go out, the ads start', meta: 'manager' },
    { id: 'a9', name: '9. watch performance',
      kind: 'track results against the brief', meta: 'manager · analytics' },
    { id: 'a10', name: '10. engage',
      kind: 'answer comments and messages', meta: 'community manager' },
    { id: 'a11', name: '11. optimize',
      kind: 'move ad money, swap stale creative', meta: 'manager · media buyer' },
    { id: 'a12', name: '12. wrap up',
      kind: 'ads off, numbers pulled, reported', meta: 'manager' },
    { id: 'a13', name: '13. record what was learned',
      kind: 'what to repeat, what to avoid', meta: 'manager' }
  ],

  lanes: [],

  scenes: {
    arrive: { quiet: 'a campaign brief arrives' },
    closeq: { quiet: 'the campaign is closed' },
    practical: { sysHead: 'the practical side' },
    golive: { sysHead: 'launch' },

    intake: {
      room: 'taking in the brief',
      cast: [
        { id: 'mg', title: 'Social media manager', mono: 'MG', role: 'runs the campaign', kind: 'chair', at: [0.32, 0.42] }
      ],
      props: [
        { id: 'bf', kind: 'artifact', label: 'campaign brief CB-118', at: [0.72, 0.42], w: 180 }
      ]
    },

    params: {
      room: 'setting the parameters',
      cast: [
        { id: 'mg', title: 'Social media manager', mono: 'MG', role: 'proposes the plan', kind: 'chair', at: [0.3, 0.58] },
        { id: 'ld', title: 'Marketing lead', mono: 'LD', role: 'confirms the budget', kind: 'pen', at: [0.7, 0.26] }
      ]
    },

    creative: {
      room: 'the creative work',
      cast: [
        { id: 'mg', title: 'Social media manager', mono: 'MG', role: 'runs the campaign', kind: 'chair', at: [0.5, 0.14] },
        { id: 'cp', title: 'Copywriter', mono: 'CP', role: 'copy', kind: 'peer', at: [0.2, 0.6] },
        { id: 'ds', title: 'Designer', mono: 'DS', role: 'design', kind: 'peer', at: [0.5, 0.6] },
        { id: 'vd', title: 'Video editor', mono: 'VD', role: 'video', kind: 'peer', at: [0.8, 0.6] }
      ],
      props: [
        { id: 'as', kind: 'artifact', label: 'the posts', hidden: true, at: [0.5, 0.97], w: 150 }
      ]
    },

    signoff: {
      room: 'sign-offs',
      cast: [
        { id: 'br', title: 'Brand reviewer', mono: 'BR', role: 'reads against the guidelines', kind: 'pen', at: [0.28, 0.2] },
        { id: 'lg', title: 'Legal reviewer', mono: 'LG', role: 'a person signs', kind: 'pen', at: [0.28, 0.64] }
      ],
      props: [
        { id: 'as3', kind: 'artifact', label: 'the posts', version: 'v1', at: [0.72, 0.42], w: 160 }
      ]
    },

    live: {
      room: 'the campaign, live',
      cast: [
        { id: 'mg', title: 'Social media manager', mono: 'MG', role: 'watches the numbers', kind: 'chair', at: [0.5, 0.16] },
        { id: 'cm', title: 'Community manager', mono: 'CM', role: 'answers everyone', kind: 'peer', at: [0.22, 0.6] },
        { id: 'mb', title: 'Media buyer', mono: 'MB', role: 'moves the money', kind: 'peer', at: [0.78, 0.6] }
      ]
    },

    wrap: {
      room: 'wrapping up',
      cast: [
        { id: 'mg', title: 'Social media manager', mono: 'MG', role: 'writes the report', kind: 'chair', at: [0.3, 0.58] },
        { id: 'ld', title: 'Marketing lead', mono: 'LD', role: 'reads it', kind: 'pen', at: [0.7, 0.26] }
      ]
    }
  },

  steps: [
    { phase: 'A brief arrives', scene: 'arrive', dur: 4600,
      runOpen: true,
      log: '· campaign brief CB-118 arrives, approved',
      note: 'A campaign brief arrives from planning, already approved. One run ' +
        'of the process starts, and the first eight activities take the ' +
        'campaign from this brief to launch.' },

    { phase: '1. take in the brief', scene: 'intake',
      run: { a1: 'active' },
      say: 'mg', to: 'bf', k: 'pen', wire: 'goal: fall-launch signups',
      log: 'the manager works out what it must accomplish',
      note: 'The manager reads the brief and pulls out what the campaign must ' +
        'accomplish, because every later judgment call comes back to that.' },

    { phase: '2. set the parameters', scene: 'params',
      run: { a1: 'done', a2: 'active' },
      rec: { ph: 'a1', t: 'goal set', k: 'done' },
      say: 'mg', to: 'ld', k: 'pen', wire: '4 channels · 6 weeks · $40k',
      log: 'platforms, audience, dates and budget proposed',
      note: 'The manager decides where the campaign runs, who it should reach ' +
        'and when it has to be live, and puts a number on it.' },

    { say: 'ld', to: 'mg', k: 'verdict', wire: 'budget confirmed',
      phase: '2. set the parameters',
      log: 'leadership confirms the money',
      note: 'The budget is the one call the manager does not make alone.' },

    { phase: '3. brief the creatives', scene: 'creative',
      run: { a2: 'done', a3: 'active', a7: 'active' },
      rec: { ph: 'a2', t: 'parameters set', k: 'done' },
      say: 'mg', to: 'room', k: 'broadcast', wire: 'the brief · concepts by friday',
      set: { cp: 'working', ds: 'working', vd: 'working' },
      log: 'the creative team hears the brief together',
      note: 'The designer, copywriter and video editor all hear the same brief ' +
        'at the same time. Activity 7, the practical side, starts now too and ' +
        'runs alongside everything up to launch - the column shows both lit.' },

    { phase: '4. settle on a direction',
      run: { a3: 'done', a4: 'active' },
      rec: { ph: 'a3', t: 'briefed', k: 'done' },
      say: 'ds', to: 'mg', k: 'pen', wire: 'concept A',
      log: 'the first concept comes back',
      note: 'Two concepts come back, each developed far enough to judge.' },

    { say: 'cp', to: 'mg', k: 'pen', wire: 'concept B',
      phase: '4. settle on a direction',
      log: 'the second concept comes back',
      note: 'The manager weighs both against the goal from the brief.' },

    { say: 'mg', to: 'room', k: 'verdict', wire: 'concept B · go',
      phase: '4. settle on a direction',
      log: 'a direction worth backing',
      note: 'The manager picks the one worth backing and says why, so the team ' +
        'knows what to protect while they produce against it.' },

    { phase: '5. produce the posts', dur: 3600,
      run: { a4: 'done', a5: 'active' },
      rec: { ph: 'a4', t: 'concept B', k: 'done' },
      log: '· copy, images and video get made inside the direction',
      note: 'Copy, images and video get made inside the chosen direction, each ' +
        'sized and worded for its platform.' },

    { say: 'mg', to: 'as', k: 'pen', wire: 'assets ready · v1',
      phase: '5. produce the posts',
      prop: { as: { hidden: false, version: 'v1' } },
      set: { cp: 'done', ds: 'done', vd: 'done' },
      log: 'the finished posts land in one place',
      note: 'The finished posts land in one place, at a version, so everyone ' +
        'downstream reads the same thing.' },

    { phase: '6. get sign-offs', scene: 'signoff',
      run: { a5: 'done', a6: 'active' },
      rec: { ph: 'a5', t: 'posts v1', k: 'done' },
      say: 'br', to: 'as3', k: 'verdict', wire: 'brand: fine',
      log: 'brand reads it against the guidelines',
      note: 'Brand checks the material against the guidelines and passes it.' },

    { say: 'lg', to: 'room', k: 'verdict', wire: 'legal: changes requested',
      phase: '6. get sign-offs',
      run: { a6: 'failed' }, set: { lg: 'failed' },
      rec: { ph: 'a6', t: 'changes requested', k: 'fail' },
      log: 'legal will not sign one of the claims',
      note: 'Legal will not sign one of the claims. This is the first dotted ' +
        'edge in the diagram: the work goes back to produce, and only the ' +
        'part that failed.' },

    { phase: '5. produce the posts - again', scene: 'creative',
      run: { a5: 'redo' },
      prop: { as: { hidden: false, version: 'v1' } },
      say: 'mg', to: 'cp', k: 'direct', wire: 'soften the claim in post 7',
      set: { cp: 'working' },
      log: 'only the copy reopens',
      note: 'Only the copy reopens. The images and video stand, because the ' +
        'sign-off named exactly what it wanted changed.' },

    { say: 'cp', to: 'mg', k: 'pen', wire: 'copy v2',
      phase: '5. produce the posts - again',
      bump: { as: 'v2' }, set: { cp: 'done' },
      run: { a5: 'done' },
      rec: { ph: 'a5', t: 'posts v2', k: 'done' },
      log: 'the fix lands and the posts move to v2',
      note: 'The fix lands and the posts move to version 2. Both rounds stay ' +
        'in the column, because the record is the run\'s history.' },

    { phase: '6. get sign-offs - again', scene: 'signoff',
      run: { a6: 'redo' },
      prop: { as3: { version: 'v2' } },
      say: 'lg', to: 'room', k: 'verdict', wire: 'approved at v2',
      log: 'legal signs against version 2',
      note: 'Legal signs against version 2. If anything changes after this, ' +
        'the approval no longer covers it.' },

    { phase: '7. set up the practical side', scene: 'practical', dur: 3400,
      run: { a6: 'done' },
      rec: { ph: 'a6', t: 'approved · v2', k: 'done' },
      sys: 'tracking links built · pixels live',
      log: '· the practical side has been running since step 3',
      note: 'This has been running alongside the creative work since the brief ' +
        'went out: the tracking links, the landing page check, the ad ' +
        'campaigns, the posting schedule.' },

    { dur: 2800, sys: 'ads configured · schedule loaded',
      phase: '7. set up the practical side',
      run: { a7: 'done' },
      rec: { ph: 'a7', t: 'ready', k: 'sys' },
      log: '· launch waits for both branches, and both are done',
      note: 'Launch waits for both branches of the diagram, and both are now ' +
        'done.' },

    { phase: '8. launch', scene: 'golive', dur: 3000,
      run: { a8: 'active' },
      sys: 'manager: clear to go',
      log: '· a person says go',
      note: 'A person says go. Nothing publishes until they do.' },

    { dur: 2800, sys: 'posts publishing · ads running',
      phase: '8. launch',
      run: { a8: 'done' },
      rec: { ph: 'a8', t: 'live', k: 'sys' },
      log: '· the posts and the ads start together',
      note: 'The scheduled posts go out and the paid campaigns start.' },

    { phase: '9-11. the campaign is live', scene: 'live',
      run: { a9: 'active', a10: 'active', a11: 'active' },
      say: 'cm', to: 'mg', k: 'direct', wire: 'replies answered · 1 flagged',
      log: 'comments and messages get answered',
      note: 'Three activities run at once for as long as the campaign is live, ' +
        'which is why the diagram draws them in one frame. The community ' +
        'manager fields the replies and flags the one that needs the manager.' },

    { say: 'mb', to: 'mg', k: 'pen', wire: 'budget moved to video',
      phase: '9-11. the campaign is live',
      rec: { ph: 'a11', t: 'ads rebalanced', k: 'done' },
      log: 'the money follows what is working',
      note: 'The numbers say video is winning, so the ad money follows it.' },

    { phase: '5. produce the posts - a third time', scene: 'creative',
      run: { a5: 'redo' },
      prop: { as: { hidden: false, version: 'v2' } },
      say: 'mg', to: 'ds', k: 'direct', wire: 'fresh statics, please',
      set: { ds: 'working' },
      log: 'the static images have gone stale',
      note: 'The static images have gone stale from repetition. The second ' +
        'dotted edge in the diagram fires: back to produce for replacements, ' +
        'in the middle of the flight.' },

    { say: 'ds', to: 'mg', k: 'pen', wire: 'statics v3',
      phase: '5. produce the posts - a third time',
      bump: { as: 'v3' }, set: { ds: 'done' },
      run: { a5: 'done' },
      rec: { ph: 'a5', t: 'posts v3', k: 'done' },
      log: 'replacements go live mid-flight',
      note: 'Replacements go live mid-flight. The column now shows produce ' +
        'closing for the third time in one run.' },

    { phase: '12. wrap up', scene: 'wrap',
      run: { a9: 'done', a10: 'done', a11: 'done', a12: 'active' },
      rec: [{ ph: 'a9', t: 'tracked', k: 'done' },
            { ph: 'a10', t: 'inbox clear', k: 'done' },
            { ph: 'a11', t: 'spend on plan', k: 'done' }],
      say: 'mg', to: 'ld', k: 'pen', wire: 'the report, against the brief',
      log: 'ads off, numbers pulled, reported',
      note: 'The window closes. The ads come off, the numbers come out of ' +
        'every channel, and the report says how the campaign did against ' +
        'what the brief asked for.' },

    { phase: '13. record what was learned', scene: 'closeq', dur: 3200,
      run: { a12: 'done', a13: 'active' },
      rec: { ph: 'a12', t: 'reported', k: 'done' },
      log: '· what to repeat, what to avoid, written down',
      note: 'What to repeat and what to avoid gets written down while it is ' +
        'still fresh.' },

    { phase: 'The campaign is closed', dur: 6400,
      run: { a13: 'done' },
      rec: { ph: 'a13', t: 'learnings kept', k: 'done' },
      runDone: true,
      log: '· the campaign is closed',
      note: 'The next campaign starts smarter, because this one wrote down ' +
        'how it went.' }
  ]
});
