



document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await axios.post('http://localhost:4000/user/login', { email, password });
    localStorage.setItem('token', res.data.token); //  Save token
    console.log("Saved token:", res.data.token);   //  Debug print
    alert('Login successful!');
    window.location.href = "index.html";          // redirect to expense page
  } catch (err) {
    console.error("Login error:", err.response ? err.response.data : err);
    alert('Login failed');
  }
});

