// Demo sign-up form: validates the email, shows a message. No data is sent anywhere.
const form = document.getElementById('signup');
const msg = document.getElementById('msg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const valid = /^\S+@\S+\.\S+$/.test(email);
  msg.className = valid ? 'msg' : 'msg err';
  msg.textContent = valid
    ? "You're on the list! (demo only, nothing was sent)"
    : 'Please enter a valid email address.';
  if (valid) form.reset();
});
