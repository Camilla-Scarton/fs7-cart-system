import { getUserToken } from './session.mjs';

const $cartItems = document.getElementById("cart-items");
const $totalItems = document.querySelectorAll(".totalItems");
const $totalItemsPrice = document.querySelector("#total-items-price");
const $totalCartPrice = document.querySelector("#total-cart-price");
const $shippingValue = document.querySelector("#shipping-value");
const $activePromoCode = document.querySelector("#active-promo-code");
const $promoCode = document.querySelector("#promo-code");

const state = {
  cart: [],
  is_active_promo: false,
  promo_info: {},
}

const reloadEvent = new Event("reloadUI");

const CART_ITEM_TEMPLATE = ({ id = null, title = null, image = null, brand = null, qnt = 0, price = 0 }) => `
  <div class="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5">
    <div class="flex w-2/5">
      <div class="w-20">
        <img class="h-24" src="${image}" alt="">
      </div>
      <div class="flex flex-col justify-between ml-4 flex-grow">
        <span class="font-bold text-sm">${title}</span>
        <span class="text-red-500 text-xs">${brand}</span>
        <button class="font-semibold hover:text-red-500 text-gray-500 text-xs text-left removeItem" data-cart-id="${id}">Remove</button>
      </div>
    </div>
    <div class="flex justify-center w-1/5">
      <button type="button" class="cursor-pointer removeQnt" data-cart-id="${id}">–</button>

      <input class="mx-2 border text-center w-8 qntInput" type="text" data-cart-id="${id}" value="${qnt}" disabled />

      <button type="button" class="cursor-pointer addQnt" data-cart-id="${id}">+</button>
    </div>
    <span class="text-center w-1/5 font-semibold text-sm">€${price}</span>
    <span class="text-center w-1/5 font-semibold text-sm">€<span class="totalItemPrice" data-cart-id="${id}">${price * qnt}</span></span>
  </div>
`;

const PROMO_CODE_TEMPLATE = ({ name = null }) => `
<span class="px-3 py-2 bg-green-200 text-green-600 text-xs font-bold rounded uppercase">
  ${name} <span class="bg-green-200 text-green-600 ml-1 cursor-pointer remove-promo">&times;</span>
</span>
`;

const reloadUI = () => document.dispatchEvent(reloadEvent);


const fetchCart = async () => {
  const token = getUserToken();

  try {
    const results = await axios({
      url: "http://localhost:3000/cart",
      method: "GET",
      headers: {
        "Authorization": `${token}`,
      }
    });

    return results.data.cart; // -> { cart: [ ... ] }
  } catch (err) {
    console.error(err);
  }
}

const renderCartItems = async () => {
  state.cart = await fetchCart();

  console.log(state.cart);

  const html = state.cart.map(item => CART_ITEM_TEMPLATE(item)).join('');

  $cartItems.innerHTML = html;
}

const renderCartInfo = () => {
  // Set total items
  const totalItems = state.cart.reduce((prev, item) => prev + item.qnt, 0);

  $totalItems.forEach($ti => {
    $ti.innerHTML = totalItems;
  });

  // Set total price
  const totalItemsPriceWithoutModifiers = state.cart.reduce((prev, item) => prev + (item.price * item.qnt), 0);

  $totalItemsPrice.innerHTML = totalItemsPriceWithoutModifiers;

  // Set modifiers
  const shippingValue = Number($shippingValue.value);

  let totalItemsPrice = totalItemsPriceWithoutModifiers;

  // Set promo code
  if (state.is_active_promo) {
    const { name, type, value } = state.promo_info;

    if (type === "amount") {
      totalItemsPrice = totalItemsPrice - value;
    } else if (type === "percentage") {
      totalItemsPrice = totalItemsPrice - (totalItemsPrice * value / 100);
    }

    const html = PROMO_CODE_TEMPLATE({ name });

    $activePromoCode.innerHTML = html;
  } else {
    $activePromoCode.innerHTML = "";
  }

  // Set price with shipping
  const totalItemsPriceWithShipping = totalItemsPrice + shippingValue;

  $totalCartPrice.innerHTML = totalItemsPriceWithShipping;
}

const _updateItemQuantity = async (cartId, qnt) => {
  const token = getUserToken();

  try {
    await axios({
      url: `http://localhost:3000/cart/${cartId}`,
      method: "PUT",
      data: {
        qnt,
      },
      headers: {
        "Authorization": `${token}`,
      }
    });
  } catch (err) {
    console.error(err);
  }
}

export const deleteItemFromCart = async (target) => {
  const token = getUserToken();
  const cartId = target.dataset.cartId;

  try {
    await axios({
      url: `http://localhost:3000/cart/${cartId}`,
      method: "DELETE",
      headers: {
        "Authorization": `${token}`,
      }
    });
  } catch (err) {
    console.error(err);
  }
}

export const updateItemQuantity = async (target, mode = "add") => {
  const cartId = target.dataset.cartId;
  const $currentQntInput = document.querySelector(`input.qntInput[data-cart-id="${cartId}"]`);

  const currentQnt = Number($currentQntInput.value);

  if (mode == "add") {
    const newQnt = currentQnt + 1;

    $currentQntInput.value = newQnt;

    await _updateItemQuantity(cartId, newQnt);
  } else if (mode == "remove") {
    if (currentQnt == 1) {
      // Remove from cart
      await deleteItemFromCart(target);
    } else {
      const newQnt = currentQnt - 1;

      $currentQntInput.value = newQnt;

      await _updateItemQuantity(cartId, newQnt);
    }
  }
}

export const applyPromoCode = async (code) => {
  try {
    const results = await axios({
      url: `http://localhost:3000/promo-code/${code}`,
      method: "GET"
    });

    state.promo_info = results.data.promo;
    state.is_active_promo = true;

    $promoCode.value = "";

    renderCartInfo();

  } catch (err) {
    console.error(err);
  }
}

export const removePromoCode = async () => {
  state.promo_info = {};
  state.is_active_promo = false;

  renderCartInfo();
}

export const init = async () => {
  await renderCartItems();

  renderCartInfo();
}
