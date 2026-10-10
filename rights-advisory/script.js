// Demo enquiry form: client-side validation only. Nothing is sent anywhere.
// In production, connect this form to your form plugin or backend endpoint.
const form = document.getElementById('enquiry');

const setErr = (id, text) => { document.getElementById(id).textContent = text; };

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const consent = document.getElementById('consent').checked;
  const ok = document.getElementById('ok');

  setErr('err-name', name.length < 2 ? 'Please enter your name.' : '');
  setErr('err-email', /^\S+@\S+\.\S+$/.test(email) ? '' : 'Please enter a valid email address.');
  setErr('err-consent', consent ? '' : 'Please tick the box to continue.');
  ok.textContent = '';

  if (name.length >= 2 && /^\S+@\S+\.\S+$/.test(email) && consent) {
    ok.textContent = 'Thank you. Your request was received (demo only, nothing was sent).';
    form.reset();
  }
});
