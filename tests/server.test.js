import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { rm } from 'node:fs/promises';
import { createAppServer } from '../server.js';

test('serves index.html, persists /api/state, and validates /api/hunt-complete', async () => {
  const tmpState = path.join(os.tmpdir(), `spookhunt-test-${Date.now()}.json`);
  const server = createAppServer(tmpState);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.ok(html.includes('SpookHunt Mobile'));

    const printPage = await fetch(`${base}/print.html`);
    assert.equal(printPage.status, 200);
    assert.ok((await printPage.text()).includes('SpookHunt Printable QR Badge Sheet'));

    const stateSave = await fetch(`${base}/api/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clues: [{ id: 'c1', title: 'Pumpkin', points: 50 }],
        teams: [{ id: 't1', name: 'The Phantoms', score: 50, completedClueIds: ['c1'] }],
        alerts: []
      })
    });
    assert.equal(stateSave.status, 200);

    const stateGet = await (await fetch(`${base}/api/state`)).json();
    assert.equal(stateGet.teams[0].name, 'The Phantoms');
    assert.ok(stateGet.updatedAt > 0);

    const bad = await fetch(`${base}/api/hunt-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName: '' })
    });
    assert.equal(bad.status, 400);

    const good = await fetch(`${base}/api/hunt-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName: 'The Phantoms', score: 650, message: 'All clues solved!' })
    });
    assert.equal(good.status, 200);
    const body = await good.json();
    assert.equal(body.status, 'DELIVERED_HTTP_200');
    assert.equal(body.alert.teamName, 'The Phantoms');

    const list = await (await fetch(`${base}/api/alerts`)).json();
    assert.equal(list.alerts.length, 1);
  } finally {
    await new Promise(r => server.close(r));
    await rm(tmpState, { force: true });
  }
});
