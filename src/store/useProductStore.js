import { create } from "zustand";
import { productData } from "../data/productData";
import toast from "react-hot-toast";

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

    fetchOrderList: async (user) => {
        if (!user) return;
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');
        const userRef = doc(db, 'people', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        if (data?.orderList) {
            set({ orderList: data.orderList });
        }
    },

    clearWishlist: () => set({ wishlist: [] }),

    onAddWishList: (product) => {
        const wish = get().wishlist;
        const existing = wish.find((w) => w.id === product.id);

        if (existing) {
            toast("이미 있는 제품입니다");
            return;
        }

        set({ wishlist: [...wish, product] });
    },

    onRemoveWish: (id) => {
        const updateWish = get().wishlist.filter((item) => item.id !== id);
        set({ wishlist: updateWish });
    },

    // 장바구니
    cartItems: [],

    syncCartToFirestore: async (cartItems) => {
        const { useAuthStore } = await import('./useAuthStore');
        const user = useAuthStore.getState().user;
        if (!user) return;
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');
        const userRef = doc(db, 'people', user.uid);
        await setDoc(userRef, { cartItems }, { merge: true });
    },

    fetchCartItems: async (user) => {
        if (!user) return;
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');
        const userRef = doc(db, 'people', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        if (data?.cartItems) {
            set({ cartItems: data.cartItems });
        }
    },

    clearCartItems: () => set({ cartItems: [] }),

    addToCart: (product, selectedOption = {}, qty = 1) => {
        const { cartItems } = get();
        const color = selectedOption.color || "";
        const isSameItem = (item) => item.id === product.id && item.color === color;
        const existItem = cartItems.find(isSameItem);

        let newCartItems;
        if (existItem) {
            newCartItems = cartItems.map((item) =>
                isSameItem(item) ? { ...item, qty: item.qty + qty } : item
            );
        } else {
            newCartItems = [...cartItems, { id: product.id, qty, checked: true, color }];
        }

        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    increaseQty: (id, color = "") => {
        const newCartItems = get().cartItems.map((item) =>
            item.id === id && item.color === color
                ? { ...item, qty: item.qty + 1 }
                : item
        );
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    decreaseQty: (id, color = "") => {
        const newCartItems = get().cartItems.map((item) =>
            item.id === id && item.color === color
                ? { ...item, qty: Math.max(1, item.qty - 1) }
                : item
        );
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    toggleChecked: (id, color = "") => {
        const newCartItems = get().cartItems.map((item) =>
            item.id === id && item.color === color
                ? { ...item, checked: !item.checked }
                : item
        );
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    toggleAllChecked: (checked) => {
        const newCartItems = get().cartItems.map((item) => ({ ...item, checked }));
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    removeCartItem: (id, color = "") => {
        const newCartItems = get().cartItems.filter(
            (item) => !(item.id === id && item.color === color)
        );
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    changeItemColor: (id, oldColor, newColor) => {
        const newCartItems = get().cartItems.map((item) =>
            item.id === id && item.color === oldColor
                ? { ...item, color: newColor }
                : item
        );
        set({ cartItems: newCartItems });
        get().syncCartToFirestore(newCartItems);
    },

    // === 주문 ===
    orderList: [],

    clearOrderList: () => set({ orderList: [] }),

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

    onAddOrder: async (order, user) => {
        const orderPrev = get().orderList;


        const exists = orderPrev.some(
            (item) => item.orderNumber === order.orderNumber
        );
        if (exists) return;

        const now = new Date();
        const deliveryDate = get().createDeliveryDate();

        const allItems = get().items;
        const enrichedItems = order.items.map((cartItem) => {
            const product = allItems.find((p) => p.id === cartItem.id);
            return { ...product, ...cartItem };
        });

        const newOrder = {
            id: Date.now(),
            date: now.toLocaleDateString(),
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            deliveryDate,
            price: order.total,
            state: "결제완료",
            ...order,
            items: enrichedItems,
        };

        const updatedOrderList = [...orderPrev, newOrder];

        set({
            orderList: updatedOrderList,
            cartItems: [],
        });

        if (user) {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase/firebase');
            const userRef = doc(db, 'people', user.uid);
            await setDoc(userRef, { orderList: updatedOrderList, cartItems: [] }, { merge: true });
        }
    },

    findGuestOrderById: (orderNumber) => {
        const orders = get().orderList;
        return orders.find(
            (order) => order.isGuest && order.orderNumber === orderNumber
        );
    },

    findGuestOrderByPhone: (phone) => {
        const orders = get().orderList;
        return orders.find(
            (order) => order.isGuest && order.guestInfo?.phone === phone
        );
    },

    //주문 취소
    // none      // 취소 신청 안 함
    // pending   // 취소 대기중
    // done      // 취소 완료
    onRequestCancelOrder: (orderNumber, itemId) =>
        set((state) => ({
            orderList: state.orderList.map((order) =>
                order.orderNumber === orderNumber
                    ? {
                        ...order,
                        items: order.items.map((item) =>
                            item.id === itemId
                                ? { ...item, cancelStatus: "pending" }
                                : item
                        ),
                    }
                    : order
            ),
        })),

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

    },
}));