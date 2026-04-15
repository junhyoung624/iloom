import React, { useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { Link, useParams } from 'react-router-dom';
import "./scss/subPage.scss"
import MdPick from '../components/MdPick';
import SubCard from '../components/SubCard';

const SubPage = () => {
    const { items, menus } = useProductStore();

    const params = useParams();
    const mainCate = params.originalCategory || originalCategory;
    const subCate = params.category2
    const thirdCate = params.category3

    let cateItems = items.filter((item) => {
        // 메인메뉴
        if (mainCate && item.originalCategory !== mainCate) return false;
        if (subCate && item.category2 !== subCate) return false;
        if (thirdCate && item.category3 !== thirdCate) return false;
        return true;
    })

    const mdPick = !subCate && !thirdCate ? cateItems.filter(md => md.mdPick === true) : []

    const categoryName = thirdCate || subCate || mainCate
    const currentMenu = menus.find(menu => menu.name === mainCate)

    const currentSubMenu = currentMenu?.subMenu.find(sub => sub.name === subCate);
    const thirdTab = currentSubMenu?.thirdMenu || [];
    const tab = currentMenu?.subMenu || [];

    const tabItems = (() => {
        if (!subCate) {

            return tab.map(t => ({ label: t.name, to: `/${mainCate}/${t.name}`, active: false }));
        }
        if (thirdTab.length > 0) {

            return thirdTab.map(t => ({ label: t.name, to: `/${mainCate}/${subCate}/${t.name}`, active: t.name === thirdCate}));
        }

        return tab.map(t => ({ label: t.name, to: `/${mainCate}/${t.name}`, active: t.name === subCate }));
        
        
    })();
    

    return (
        <div className='sub-page-wrap'>
            <div className="sub-page">
                <div className="inner">
                    <h1>{categoryName}</h1>

                    {tabItems.length > 0 && (
                        <ul className="menu-tab">
                            {tabItems.map((t) => (
                                <li key={t.label} className={t.active ? "active" : ""}>
                                    <Link to={t.to}>{t.label}</Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {mdPick.length > 0 && (
                        <div className="md-pick-wrap">
                            <MdPick mdPick={mdPick} />
                        </div>
                    )}

                    <div className="sub-product-list-wrap">

                        <ul className="sub-product-list">
                            {cateItems.map((item, id) => (
                                <li key={id}>
                                    <Link>
                                        <SubCard item={item} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubPage