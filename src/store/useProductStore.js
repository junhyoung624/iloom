import { create } from "zustand";
import { productData } from "../data/productData";
// import { persist } from "zustand/middleware";

export const useProductStore = create((set, get) => ({
    // 상품 변수, 메서드
    items: [],

    // 메뉴
    menus: [],

    // 검색
    searchWord: "",
    onSetSearchWord: (word) => set({ searchWord: word }),

    searchWordAll: "",
    onSetSearchWordAll: (word) => set({ searchWordAll: word }),

    // 정렬
    sortType: "",
    sortOrder: "asc",
    onSetSort: (type, order = "asc") =>
        set({ sortType: type, sortOrder: order }),

    onfetchItems: async () => {
        const existing = get().items;
        if (existing.length > 0) return;
        set({ items: productData });
    },

    // 위시리스트
    wishlist: [],

    isWished: (id) => {
        const wishlist = get().wishlist;
        return wishlist.some((item) => item.id === id);
    },

    onToggleWishList: (item) => {
        const { wishlist } = get();
        const exists = wishlist.some((wishItem) => wishItem.id === item.id);

        set({
            wishlist: exists
                ? wishlist.filter((wishItem) => wishItem.id !== item.id)
                : [...wishlist, item],
        });
    },

    onAddWishList: (product) => {
        const wish = get().wishlist;
        const existing = wish.find((w) => w.id === product.id);

        if (existing) {
            alert("이미 있는 제품입니다");
            return;
        }

        set({
            wishlist: [...wish, product],
        });
    },

    onAddWishList: (product) => {
        const wish = get().wishlist;
        const existing = wish.find((w) => w.id === product.id);

        if (existing) {
            alert("이미 있는 제품입니다");
            return;
        }

        set({
            wishlist: [...wish, product],
        });
    },

    onRemoveWish: (id) => {
        const updateWish = get().wishlist.filter((item) => item.id !== id);
        set({
            wishlist: updateWish,
        })
    },

    // 장바구니
    cartItems: [],

    addToCart: (product, selectedOption = {}, qty = 1) => {
        const { cartItems } = get();

        const existItem = cartItems.find(
            (item) =>
                item.id === product.id &&
                item.color === (selectedOption.color || "")
        );

        if (existItem) {
            set({
                cartItems: cartItems.map((item) =>
                    item.id === product.id &&
                        item.color === (selectedOption.color || "")
                        ? { ...item, qty: item.qty + qty }
                        : item
                ),
            });
        } else {
            set({
                cartItems: [
                    ...cartItems,
                    {
                        id: product.id,
                        qty,
                        checked: true,
                        color: selectedOption.color || "",
                    },
                ],
            });
        }
    },

    increaseQty: (id, color = "") => {
        set({
            cartItems: get().cartItems.map((item) =>
                item.id === id && item.color === color
                    ? { ...item, qty: item.qty + 1 }
                    : item
            ),
        });
    },

    decreaseQty: (id, color = "") => {
        set({
            cartItems: get().cartItems.map((item) =>
                item.id === id && item.color === color
                    ? { ...item, qty: Math.max(1, item.qty - 1) }
                    : item
            ),
        });
    },

    toggleChecked: (id, color = "") => {
        set({
            cartItems: get().cartItems.map((item) =>
                item.id === id && item.color === color
                    ? { ...item, checked: !item.checked }
                    : item
            ),
        });
    },

    toggleAllChecked: (checked) => {
        set({
            cartItems: get().cartItems.map((item) => ({
                ...item,
                checked,
            })),
        });
    },

    removeCartItem: (id, color = "") => {
        set({
            cartItems: get().cartItems.filter(
                (item) => !(item.id === id && item.color === color)
            ),
        });
    },

    // 메뉴 생성
    onMakeMenu: () => {
        const items = get().items;
        const menuList = [];

        items.forEach(({ originalCategory, category2, category3 }) => {
            let mainMenu = menuList.find(
                (menu) => menu.name === originalCategory
            );

            if (!mainMenu) {
                mainMenu = {
                    name: originalCategory,
                    link: `/${originalCategory}`,
                    subMenu: [],
                };
                menuList.push(mainMenu);
            }

            let subMenu = mainMenu.subMenu.find(
                (sub) => sub.name === category2
            );

            if (!subMenu && category2) {
                subMenu = {
                    name: category2,
                    link: `/${originalCategory}/${category2}`,
                    thirdMenu: [],
                };
                mainMenu.subMenu.push(subMenu);
            }

            if (subMenu && category3) {
                const thirdMenu = subMenu.thirdMenu.find(
                    (th) => th.name === category3
                );

                if (!thirdMenu) {
                    subMenu.thirdMenu.push({
                        name: category3,
                        link: `/${originalCategory}/${category2}/${category3}`,
                    });
                }
            }
        });

        set({ menus: menuList });
        console.log(menuList);
    },
}));