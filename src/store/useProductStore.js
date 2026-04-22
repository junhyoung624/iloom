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
    sortType: "price",
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

    onToggleWishList: async (item, user) => {
        const { wishlist } = get();
        const exists = wishlist.some((wishItem) => wishItem.id === item.id);

        const newWishlist = exists
            ? wishlist.filter((wishItem) => wishItem.id !== item.id)
            : [...wishlist, item];

        set({ wishlist: newWishlist });

        if (user) {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase/firebase');
            const userRef = doc(db, 'people', user.uid);
            await setDoc(userRef, { wishlist: newWishlist }, { merge: true });
        }
    },

    fetchWishlist: async (user) => {
        if (!user) return;
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');
        const userRef = doc(db, 'people', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        if (data?.wishlist) {
            set({ wishlist: data.wishlist });
        }
    },

    clearWishlist: () => set({ wishlist: [] }),

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
        const color = selectedOption.color || "";

        const isSameItem = (item) =>
            item.id === product.id && item.color === color;

        const existItem = cartItems.find(isSameItem);

        if (existItem) {
            set({
                cartItems: cartItems.map((item) =>
                    isSameItem(item)
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
                        color,
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

    changeItemColor: (id, oldColor, newColor) => {
        set(state => ({
            cartItems: state.cartItems.map(item =>
                item.id === id && item.color === oldColor
                    ? { ...item, color: newColor }
                    : item
            )
        }))
    },
    //주문
    //주문 목록을 저장할 변수
    orderList: [],

    createDeliveryDate: () => {
        const today = new Date();
        const randomDays = Math.floor(Math.random() * 10) + 1;

        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + randomDays);

        const year = deliveryDate.getFullYear();
        const month = String(deliveryDate.getMonth() + 1).padStart(2, "0");
        const date = String(deliveryDate.getDate()).padStart(2, "0");

        return `${year}.${month}.${date}`;
    },

    //결제를 클릭하면 결제 항목이 주문 목록에 들어가도록
    onAddOrder: (order) => {
        const orderPrev = get().orderList;
        console.log("onAddOrder in", order);

        //같은 주문번호가 이미 있으면 추가 안함
        const exists = orderPrev.some(
            (item) => item.orderNumber === order.orderNumber
        );

        if (exists) return;

        const now = new Date();
        const deliveryDate = get().createDeliveryDate();

        const newOrder = {
            id: Date.now(),
            // orderTime: new Date(),
            date: now.toLocaleDateString(),
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            deliveryDate,
            items: order.items,
            price: order.total,
            color: order.color,
            state: "결제완료",
            ...order, //charge.jsx에서 넘긴 값들 그대로 저장하기
        };

        //const updateOrder = [...orderPrev, newOrder];

        set({
            orderList: [...orderPrev, newOrder],
            cartItems: get().cartItems.filter((item) => !item.checked),
            //cartCount: 0,
            cartItems: [],
        })
    },

    //비회원 주문 조회 
    //주문번호로 조회
    findGuestOrderById: (orderNumber) => {
        const orders = get().orderList;

        return orders.find(
            (order) =>
                order.isGuest &&
                order.orderNumber === orderNumber
        );
    },

    //전화번호로 조회
    findGuestOrderByPhone: (phone) => {
        const orders = get().orderList;

        return orders.find(
            (order) =>
                order.isGuest &&
                order.guestInfo?.phone === phone
        );
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
