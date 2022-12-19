export const InternalCache = {
  save(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  },
  get(name) {
    return JSON.parse(localStorage.getItem(name));
  },
  remove(name) {
    localStorage.removeItem(name);
  },
}
