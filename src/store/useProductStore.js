import { create } from "zustand";
import { ProductData } from "../data/product.Data";

export const useProductStore = create((set, get) => ({

    // 상품 
    items: [],

    onfetchItems: async () => {
        const existing = get().items;
        if (existing.length > 0) return;
        set({items: ProductData})
    },

    // 메뉴 
    menus: [],

    onMakeMenu: () => {
        const items = get().items;

        const menuList = [];

        items.forEach(({originalCategory, category2, category3}) => {
            // 메뉴 find로 찾기
            let mainMenu = menuList.find((menu) => menu.name === originalCategory);
            if (!mainMenu) {
                mainMenu = {name: originalCategory, link: `/${originalCategory}`, subMenu: []}
                menuList.push(mainMenu);
            }

            // 두번째 서브메뉴 
            let subMenu = mainMenu.subMenu.find((sub) => sub.name === category2)
            if (!subMenu && category2) {
                subMenu = ({name: category2, link: `/${originalCategory}/${category2}`, thirdMenu: []})
                mainMenu.subMenu.push(subMenu)
            }

            // 세번째 서브메뉴
            let thirdMenu = subMenu.thirdMenu.find((th) => th.name === category3);
            if (!thirdMenu && category3) {
                subMenu.thirdMenu.push({name: category3, link: `/${originalCategory}/${category2}/${category3}`})
            }
        })

        set({menus: menuList});
        console.log(menuList);
        
    },


}))