export default {
  get token() {
    return localStorage.getItem("token");
  },
  set token(v) {
    v ? localStorage.setItem("token", v) : localStorage.removeItem("token");
  },
  get user() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  set user(u) {
    u
      ? localStorage.setItem("user", JSON.stringify(u))
      : localStorage.removeItem("user");
  },
  logout() {
    this.token = null;
    this.user = null;
  },
  get theme() {
    // Returns the saved theme ('dark' or 'light') or null
    return localStorage.getItem("theme");
  },
  set theme(t) {
    // If a theme value is provided, save it; otherwise, remove the key
    t ? localStorage.setItem("theme", t) : localStorage.removeItem("theme");
  },
};