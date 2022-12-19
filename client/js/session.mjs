import { InternalCache } from "./cache.mjs"

export const login = async (email, password) => {
  try {
    const results = await axios({
      url: "http://localhost:3000/users/login",
      method: "POST",
      data: {
        email,
        password,
      }
    });

    const { user, token } = results.data;

    InternalCache.save("user", user);
    InternalCache.save("token", token);

    return results.data
  } catch (err) {
    console.error(err);
    // throw err;
  }
};

export const logout = () => {
  InternalCache.remove("user");
  InternalCache.remove("token");
};

export const getUserToken = () => {
  return InternalCache.get("token");
}
