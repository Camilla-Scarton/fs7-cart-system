import { getUserToken, login, logout } from './session.mjs';
import { applyPromoCode, deleteItemFromCart, init as initCart, removePromoCode, updateItemQuantity } from './cart.mjs';

const $cartWrapper = document.querySelector("#cart-wrapper");
const $loginWrapper = document.querySelector("#login-wrapper");

const $loginForm = document.querySelector("#login-form");
const $email = document.querySelector("#email");
const $password = document.querySelector("#password");

const $logoutButton = document.querySelector("#logout-button");
const $promoCode = document.querySelector("#promo-code");
const $applyPromoCode = document.querySelector("#apply-promo-code");
const $shippingValue = document.querySelector("#shipping-value");

const reloadUI = () => {
  const token = getUserToken();

  if (token) {
    $loginWrapper.classList.add("hidden");
    $cartWrapper.classList.remove("hidden");

    initCart();
  } else {
    $cartWrapper.classList.add("hidden");
    $loginWrapper.classList.remove("hidden");
  }
}

$loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $email.value;
  const password = $password.value;

  await login(email, password);

  $email.value = "";
  $password.value = "";

  reloadUI();
});

$logoutButton.addEventListener("click", () => {
  logout();

  reloadUI();
});

$applyPromoCode.addEventListener("click", async () => {
  const code = $promoCode.value;

  await applyPromoCode(code);
});

document.addEventListener("click", async (e) => { // PointerEvent
  // e.preventDefault();

  const { target } = e; // e.target

  if (target.classList.contains("addQnt")) {
    // Click on add qnt
    await updateItemQuantity(target, "add");

    reloadUI();
  } else if (target.classList.contains("removeQnt")) {
    // Click on remove qnt
    await updateItemQuantity(target, "remove");

    reloadUI();
  } else if (target.classList.contains("removeItem")) {
    // Click on remove item
    await deleteItemFromCart(target);

    reloadUI();
  } else if (target.classList.contains("remove-promo")) {
    await removePromoCode();
  }
});

$shippingValue.addEventListener("change", () => {
  reloadUI();
});

reloadUI();
