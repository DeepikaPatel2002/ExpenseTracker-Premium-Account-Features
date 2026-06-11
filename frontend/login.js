



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



document.getElementById("sendResetBtn")
  .addEventListener("click", async () => {

    const email =
      document.getElementById("forgotEmail").value;

    try {

      const res = await axios.post(
        "http://localhost:4000/password/forgotpassword",
        { email }
      );

      console.log(res.data);

      alert(res.data.message);

    } catch (err) {

      console.error(err.response?.data || err);

      alert(
        err.response?.data?.message ||
        "Failed to send email"
      );
    }
});

document.getElementById('forgotBtn')
.addEventListener('click', (e) => {

  e.preventDefault();

  document.getElementById('forgotSection')
    .style.display = 'block';
});