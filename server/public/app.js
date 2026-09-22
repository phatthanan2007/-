const status = document.querySelector("#status");
const logout = document.querySelector("#logout");
const showUser = (user) => { status.textContent = `สวัสดี ${user.name} (${user.role})`; logout.hidden = false; };
const saved = JSON.parse(localStorage.getItem("auth") || "null");
if (saved?.user) showUser(saved.user);

async function submit(form, endpoint) {
  const body = Object.fromEntries(new FormData(form));
  const response = await fetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
  localStorage.setItem("auth", JSON.stringify(data));
  showUser(data.user); form.reset();
}
document.querySelector("#login").addEventListener("submit", async (e) => { e.preventDefault(); try { await submit(e.target, "login"); } catch (err) { status.textContent = err.message; } });
document.querySelector("#register").addEventListener("submit", async (e) => { e.preventDefault(); try { await submit(e.target, "register"); } catch (err) { status.textContent = err.message; } });
logout.addEventListener("click", () => { localStorage.removeItem("auth"); logout.hidden = true; status.textContent = "เข้าสู่ระบบหรือสร้างบัญชีใหม่"; });
