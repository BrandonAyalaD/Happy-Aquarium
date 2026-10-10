'use strict';
(async function () {
  const game = window.aquariumGame, $ = id => document.getElementById(id);
  const cfg = window.AQUARIUM_CLOUD || {}, button = $('account');
  const modal = $('accountDialog'), body = $('accountBody');
  let client, user = null, ready = false, revision = 0, pending = false, busy = false, conflict = false, generation = 0;
  const guestKey = 'acuario-feliz-v1';
  const key = id => 'acuario-feliz-user-' + id;
  const metaKey = id => key(id) + '-sync';
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const writeMeta = () => localStorage.setItem(metaKey(user.id), JSON.stringify({ revision, pending }));
  const status = text => { $('saveStatus').textContent = text; };
  function panel(html, required = false) {
    body.innerHTML = html; $('closeAccount').hidden = required;
    modal.oncancel = e => { if (required) e.preventDefault(); };
    if (!modal.open) modal.showModal();
  }
  function pause(on) { game.pause(on); document.querySelector('main').inert = on; $('settings').disabled = on; }
  function useGuest() {
    generation++; user = null; ready = false; conflict = false; pending = false;
    game.storage(guestKey); game.replace(read(guestKey) || game.fresh()); pause(false);
    button.textContent = '☁ Mi cuenta'; modal.close(); game.save();
  }
  async function remote() {
    const { data, error } = await client.from('aquarium_saves').select('payload,revision,updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error; return data;
  }
  function activate(payload, rev, dirty) {
    if (!game.validate(payload)) throw new Error('La partida no es válida.');
    revision = Number(rev); pending = dirty; conflict = false; ready = true;
    game.storage(key(user.id)); game.replace(payload); writeMeta(); pause(false); modal.close();
    button.textContent = '☁ Mi cuenta'; game.save();
  }
  function chooseConflict(row, local) {
    conflict = true; ready = false; pause(true);
    panel('<h2>Hay dos versiones de tu acuario</h2><p>La nube cambió desde otro dispositivo. Elige la partida que quieres continuar.</p><div class="actions"><button id="useRemote">Continuar partida de la nube</button><button id="useLocal">Usar copia de este dispositivo</button><button id="leaveAccount">Volver como invitado</button></div>', true);
    $('useRemote').onclick = () => activate(row.payload, row.revision, false);
    $('useLocal').onclick = () => { activate(local, row.revision, true); flush(); };
    $('leaveAccount').onclick = logout;
  }
  async function hydrate(session) {
    const epoch = ++generation; ready = false; pause(true); user = session.user;
    status('☁ Recuperando tu acuario…');
    try {
      const row = await remote(); if (epoch !== generation) return;
      const local = read(key(user.id)), meta = read(metaKey(user.id));
      if (row) {
        if (local && meta?.pending && game.validate(local)) {
          if (Number(meta.revision) !== Number(row.revision)) return chooseConflict(row, local);
          activate(local, row.revision, true);
        } else activate(row.payload, row.revision, false);
      } else if (local && game.validate(local)) activate(local, 0, true);
      else {
        panel('<h2>Tu primer acuario en la nube</h2><p>Puedes empezar de cero o conservar la partida de invitado de este navegador.</p><div class="actions"><button id="freshAccount">Crear un acuario nuevo</button><button id="migrateGuest">Conservar mi partida de invitado</button><button id="leaveAccount">Volver como invitado</button></div>', true);
        $('freshAccount').onclick = () => activate(game.fresh(), 0, true);
        $('migrateGuest').onclick = () => activate(read(guestKey) || game.fresh(), 0, true);
        $('leaveAccount').onclick = logout;
      }
    } catch (e) {
      if (epoch !== generation) return;
      panel('<h2>No pudimos recuperar tu partida</h2><p>Tu progreso se conserva. Comprueba la conexión e inténtalo otra vez.</p><div class="actions"><button id="retryAccount">Reintentar</button><button id="leaveAccount">Jugar como invitado</button></div>', true);
      $('retryAccount').onclick = () => hydrate(session); $('leaveAccount').onclick = logout;
      status('☁ No se pudo conectar con la nube');
    }
  }
  async function flush() {
    if (!user || !ready || !pending || busy || conflict) return false;
    const epoch = generation, owner = user.id, snapshot = game.snapshot(); busy = true; pending = false;
    status('☁ Guardando en la nube…');
    try {
      const { data, error } = await client.rpc('save_aquarium', { p_payload: snapshot, p_revision: revision });
      if (error) throw error;
      if (epoch !== generation || user?.id !== owner) return false;
      revision = Number(data.revision); writeMeta();
      status(pending ? '☁ Cambios pendientes de guardar' : '✓ Partida guardada en la nube'); return true;
    } catch (e) {
      if (epoch !== generation) return false;
      pending = true; writeMeta();
      if (String(e.message).includes('save_conflict')) {
        try { const row = await remote(); if (epoch === generation && row) chooseConflict(row, game.snapshot()); } catch { status('☁ Sin conexión; copia local conservada'); }
      } else status('☁ Sin conexión; guardado en este dispositivo. Reintentaremos.');
      return false;
    } finally { busy = false; }
  }
  async function logout() {
    if (busy) return;
    if (ready && pending && !await flush()) {
      if (conflict) return;
      panel('<h2>Quedan cambios por subir</h2><p>Tu copia está guardada en este dispositivo. Para recuperarla en otro, vuelve a conectar antes de cerrar sesión.</p><div class="actions"><button id="retrySave">Reintentar guardado</button><button id="localLogout">Cerrar sesión conservando la copia local</button></div>');
      $('retrySave').onclick = async () => { if (await flush()) await logout(); };
      $('localLogout').onclick = async () => { await client.auth.signOut({ scope: 'local' }); useGuest(); };
      return;
    }
    const { error } = await client.auth.signOut({ scope: 'local' }); if (error) return status('No se pudo cerrar sesión. Reintenta.'); useGuest();
  }
  function message(text) { $('authMessage').textContent = text; }
  function account(mode = 'login') {
    if (mode === 'reset' && cfg.passwordRecovery === false) return panel('<h2>Recuperación por correo pendiente</h2><p>El envío de correos todavía no está configurado. Conserva tu contraseña para volver a tu acuario.</p>');
    if (!client) return panel('<h2>Tu acuario, siempre contigo</h2><p>El juego está disponible en modo invitado. Las cuentas estarán disponibles cuando terminemos de conectar el servicio de partidas.</p>');
    if (user && ready) {
      panel('<h2>Mi cuenta</h2><p id="signedEmail"></p><p>Tu acuario se guarda automáticamente. Puedes continuar desde otro dispositivo al iniciar sesión.</p><div class="actions"><button id="saveNow">Guardar ahora</button><button id="logout">Cerrar sesión</button></div><p id="authMessage" role="status"></p>');
      $('signedEmail').textContent = user.email; $('saveNow').onclick = async () => message(await flush() ? 'Partida guardada.' : pending ? 'Hay cambios pendientes. Comprueba la conexión.' : 'Tu partida ya está guardada.'); $('logout').onclick = logout; return;
    }
    const recovery = mode === 'recovery', register = mode === 'register', reset = mode === 'reset';
    panel('<h2>' + (recovery ? 'Elige una contraseña nueva' : register ? 'Crear mi cuenta' : reset ? 'Recuperar contraseña' : 'Entrar a mi acuario') + '</h2><p>Guarda tus peces y tu progreso para volver cuando quieras.</p><form id="authForm">' + (recovery ? '' : '<label>Correo electrónico<input id="authEmail" type="email" autocomplete="email" required maxlength="254"></label>') + (reset ? '' : '<label>Contraseña<input id="authPassword" type="password" autocomplete="' + (register || recovery ? 'new-password' : 'current-password') + '" minlength="8" required maxlength="128"></label>') + '<button id="authSubmit">' + (recovery ? 'Guardar contraseña' : register ? 'Crear cuenta' : reset ? 'Enviar enlace' : 'Iniciar sesión') + '</button></form><p id="authMessage" role="status"></p><div class="actions">' + (recovery ? '' : '<button id="showLogin">Iniciar sesión</button><button id="showRegister">Crear cuenta</button><button id="showReset">Olvidé mi contraseña</button>') + '</div>');
    if (!recovery) { $('showLogin').onclick = () => account(); $('showRegister').onclick = () => account('register'); $('showReset').onclick = () => account('reset'); }
    $('authForm').onsubmit = async e => {
      e.preventDefault(); $('authSubmit').disabled = true;
      const email = $('authEmail')?.value.trim(), password = $('authPassword')?.value;
      const redirect = location.origin + location.pathname;
      try {
        let result;
        if (recovery) result = await client.auth.updateUser({ password });
        else if (register) result = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
        else if (reset) result = await client.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        else result = await client.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        if (recovery) { account(); message('Contraseña actualizada.'); }
        else if (reset) message('Si existe una cuenta con ese correo, recibirás un enlace para recuperarla.');
        else if (register && !result.data.session) { $('authPassword').value = ''; message('Revisa tu correo y confirma la cuenta antes de entrar.'); }
      } catch (err) { message(mode === 'login' ? 'No pudimos iniciar sesión. Revisa correo, contraseña y confirmación de tu cuenta.' : 'No se pudo completar la solicitud. Revisa los datos o vuelve a intentarlo en unos minutos.'); }
      finally { if ($('authSubmit')) $('authSubmit').disabled = false; }
    };
  }
  button.onclick = () => account(); $('closeAccount').onclick = () => modal.close();
  window.aquariumCloud = {
    identity: () => ready && user ? { id: user.id } : null,
    openAccount: () => { if (!user || ready) account(); },
    async rpc(name, args = {}) {
      if (!client || !user || !ready || conflict) throw Error('sign_in_first');
      const epoch = generation;
      const { data, error } = await client.rpc(name, args);
      if (epoch !== generation) throw Error('session_changed');
      if (error) throw error;
      return data;
    },
    async claimExpedition(id) {
      if (!client || !user || !ready || conflict || busy) throw Error('save_busy');
      const epoch = generation;
      game.save(); pause(true);
      try {
        if (pending && !await flush()) throw Error('save_first');
        if (epoch !== generation || !ready || conflict) throw Error('session_changed');
        busy = true;
        const { data, error } = await client.rpc('aquarium_expedition_claim', { p_id: id, p_revision: revision });
        if (error) throw error;
        if (epoch !== generation) throw Error('session_changed');
        activate(data.payload, data.revision, false);
        return data.reward;
      } catch (error) {
        if (epoch === generation && String(error.message).includes('save_conflict')) {
          const row = await remote();
          if (row && epoch === generation) { document.getElementById('socialDialog')?.close(); chooseConflict(row, game.snapshot()); }
        }
        throw error;
      } finally {
        busy = false;
        if (epoch === generation && ready && !conflict) pause(false);
      }
    }
  };
  window.addEventListener('aquarium-save', () => {
    if (!user || !ready || conflict) return;
    pending = true; try { writeMeta(); } catch { status('No hay espacio local. Guarda ahora en tu cuenta.'); }
  });
  if (!/^https:\/\/[^/]+\.supabase\.co$/.test(cfg.url) || !cfg.publishableKey) return;
  pause(true); status('☁ Conectando…');
  try {
    await new Promise((resolve, reject) => {
      if (window.supabase) return resolve();
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
    client = window.supabase.createClient(cfg.url, cfg.publishableKey);
    let recovering = false;
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') recovering = true;
      if (event === 'SIGNED_OUT') { if (user) useGuest(); return; }
      if (session && session.user.id !== user?.id) setTimeout(async () => { await hydrate(session); if (recovering) { recovering = false; account('recovery'); } }, 0);
    });
    const { data, error } = await client.auth.getSession(); if (error) throw error;
    if (data.session && !user) await hydrate(data.session); else if (!data.session) { pause(false); game.save(); }
    setInterval(flush, 15000); window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { game.save(); flush(); } });
    window.addEventListener('pagehide', () => { game.save(); flush(); });
  } catch {
    client = null; pause(false); status('☁ Servicio no disponible. Tu partida sigue guardada aquí.');
  }
})();
