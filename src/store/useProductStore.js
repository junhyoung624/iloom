import { create } from "zustand";
import { productData } from "../data/productData";
import { persist } from "zustand/middleware";

export const useProductStore = create(persist((set, get) => ({

   //상품 변수, 메서드
    items: [],
    //메뉴를 저장할 변수
    menus: [],
    //search 서브 페이지내에서의 
    searchWord: "",
    onSetSearchWord: (word) => set({ searchWord: word }),
    // 전체 search
    searchWordAll: "",
    onSetSearchWordAll: (word) => set({ searchWordAll: word }),

    //정렬
    //정렬의 종류를 체크할 변수
    sortType: "",
    //정렬의 차순을 저장할 변수 기본오름
    sortOrder: "asc",
    onSetSort: (type, order = "asc") =>
        set({ sortType: type, sortOrder: order }),

    onfetchItems: async () => {
        const existing = get().items;
        if (existing.length > 0) return;
        set({ items: productData })
    },

    // 메뉴 
    menus: [],

    onMakeMenu: () => {
        const items = get().items;

        const menuList = [];

        items.forEach(({ originalCategory, category2, category3 }) => {
            // 메뉴 find로 찾기
            let mainMenu = menuList.find((menu) => menu.name === originalCategory);
            if (!mainMenu) {
                mainMenu = { name: originalCategory, link: `/${originalCategory}`, subMenu: [] }
                menuList.push(mainMenu);
            }

            // 두번째 서브메뉴 
            let subMenu = mainMenu.subMenu.find((sub) => sub.name === category2)
            if (!subMenu && category2) {
                subMenu = ({ name: category2, link: `/${originalCategory}/${category2}`, thirdMenu: [] })
                mainMenu.subMenu.push(subMenu)
            }

            // 세번째 서브메뉴
            let thirdMenu = subMenu.thirdMenu.find((th) => th.name === category3);
            if (!thirdMenu && category3) {
                subMenu.thirdMenu.push({ name: category3, link: `/${originalCategory}/${category2}/${category3}` })
            }
        })

        set({ menus: menuList });
        console.log(menuList);

    },


})))