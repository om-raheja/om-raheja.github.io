// Admin settings panel. Only ever present on pages boosted server-side for an
// admin session (the markup is injected by functions/blog/[[path]].js). Loads
// the authorized-email allowlist from /api/emails and lets the admin add or
// remove emails that may sign in to the blog. Admin emails are always shown,
// greyed out, and cannot be removed.
(function () {
    'use strict';

    var panel = document.querySelector('details.admin-nav.site-nav');
    if (!panel) return;

    var listEl = document.getElementById('admin-list');
    var addForm = document.getElementById('admin-add');
    var emailInput = document.getElementById('admin-email');
    var msgEl = document.getElementById('admin-msg');
    if (!listEl || !addForm || !emailInput || !msgEl) return;

    function flash(text, kind) {
        msgEl.textContent = text;
        msgEl.hidden = false;
        msgEl.className = 'admin-msg ' + (kind || 'err');
        clearTimeout(flash._t);
        flash._t = setTimeout(function () {
            msgEl.hidden = true;
        }, 4000);
    }

    function render(data) {
        var admins = data.admins || [];
        var emails = data.emails || [];
        listEl.textContent = '';

        var adminSet = {};
        admins.forEach(function (a) { adminSet[a] = true; });

        var found = {};
        var merged = [];
        emails.forEach(function (e) {
            if (!found[e]) {
                found[e] = true;
                merged.push({ email: e, admin: !!adminSet[e] });
            }
        });
        admins.forEach(function (a) {
            if (!found[a]) {
                found[a] = true;
                merged.push({ email: a, admin: true });
            }
        });

        merged.forEach(function (item) {
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.textContent = item.email;
            li.appendChild(span);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.title = item.admin ? 'Admin — cannot remove' : 'Remove';
            btn.textContent = '\u00d7';
            btn.className = 'del';
            if (item.admin) {
                li.className = 'admin';
                btn.disabled = true;
            } else {
                btn.addEventListener('click', function () {
                    remove(item.email);
                });
            }
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }

    function showErr(e) {
        flash((e && e.error) || 'Something went wrong.', 'err');
    }

    function load() {
        fetch('/api/emails')
            .then(function (r) { return r.json().then(function (j) { return r.ok ? j : Promise.reject(j); }); })
            .then(render)
            .catch(showErr);
    }

    function remove(email) {
        fetch('/api/emails', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
        })
            .then(function (r) { return r.json().then(function (j) { return r.ok ? j : Promise.reject(j); }); })
            .then(function (data) {
                render(data);
                flash('Removed ' + email + '.', 'ok');
            })
            .catch(showErr);
    }

    addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = emailInput.value.trim();
        if (!email) return;
        emailInput.disabled = true;
        addForm.querySelector('button').disabled = true;
        fetch('/api/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
        })
            .then(function (r) { return r.json().then(function (j) { return r.ok ? j : Promise.reject(j); }); })
            .then(function (data) {
                emailInput.value = '';
                render(data);
                flash('Added ' + email + '.', 'ok');
            })
            .catch(showErr)
            .then(function () {
                emailInput.disabled = false;
                addForm.querySelector('button').disabled = false;
                emailInput.focus();
            });
    });

    load();
})();