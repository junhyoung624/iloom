import React, { useEffect, useRef, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { Link, useParams } from 'react-router-dom';
import "./scss/subPage.scss"
import MdPick from '../components/MdPick';
import SubCard from '../components/SubCard';
import Breadcrumb from '../components/Breadcrumb';

const SubPage = () => {
    const bannerImgData = [
        { category: "침실", imgUrl: "./images/subpage-images/bed-room.jpg" },
        { category: "옷장", imgUrl: "./images/subpage-images/closet.jpg" },
        { category: "주방", imgUrl: "./images/subpage-images/dining-room.jpg" },
        { category: "키즈룸", imgUrl: "./images/subpage-images/kids-room.jpg" },
        { category: "조명", imgUrl: "./images/subpage-images/lighting.jpg" },
        { category: "서재", imgUrl: "./images/subpage-images/library.jpg" },
        { category: "거실", imgUrl: "./images/subpage-images/living-room.jpg" },
        { category: "학생방", imgUrl: "./images/subpage-images/study-room.jpg" },
        { category: "매트리스", imgUrl: "./images/subpage-images/metress.png" }
    ]

    const { items, menus, sortType, sortOrder, onSetSort } = useProductStore();

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
            return [
                { label: "전체", to: `/${mainCate}`, active: !thirdCate },
                ...tab.map(t => ({ label: t.name, to: `/${mainCate}/${t.name}`, active: false }))
            ];
        }
        if (thirdTab.length > 0) {
            return [
                { label: "전체", to: `/${mainCate}/${subCate}`, active: !thirdCate },
                ...thirdTab.map(t => ({ label: t.name, to: `/${mainCate}/${subCate}/${t.name}`, active: t.name === thirdCate }))
            ]
        }

        return [
            { label: "전체", to: `/${mainCate}`, active: !subCate },
            ...tab.map(t => ({ label: t.name, to: `/${mainCate}/${t.name}`, active: t.name === subCate }))
        ]


    })();



    if (sortType) {
        cateItems = [...cateItems].sort((a, b) => {
            switch (sortType) {
                case "price":
                    const aPrice = Number(String(a.price).replace(/,/g, ""));
                    const bPrice = Number(String(b.price).replace(/,/g, ""));
                    return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
                case "ranking":
                    return b.ranking - a.ranking
                case "new":
                    return Number(b.new) - Number(a.new)
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0;
            }
        })
    }

    const bannerImg = bannerImgData.find(ban => ban.category === mainCate)?.imgUrl

    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20;
    const totalPages = Math.ceil(cateItems.length / itemPage);

    const pageItem = cateItems.slice(
        (currentPage - 1) * itemPage,
        currentPage * itemPage
    )

    useEffect(() => {
        setCurrentPage(1);
    }, [mainCate, subCate, thirdCate]);

    useEffect(() => {
            onSetSort("price", "desc");
        },[location.pathname])

    return (
        <div className='sub-page-wrap'>
            {!subCate && !thirdCate && (<p className='banner-img'><img src={bannerImg} alt="img" /></p>)}
            <div className="sub-page">
                <ul className="breadcrumb-list">
                    <Breadcrumb mainCate={mainCate} subCate={subCate} thirdCate={thirdCate} />
                </ul>
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
                        <div className="sort-wrap">
                            <button className={sortType === "price" ? "active" : ""} onClick={() => onSetSort("price", "desc")}>가격순</button>
                            <button className={sortType === "ranking" ? "active" : ""} onClick={() => onSetSort("ranking", "asc")}>인기순</button>
                            <button className={sortType === "new" ? "active" : ""} onClick={() => onSetSort("new", "asc")}>신상품순</button>
                            <button className={sortType === "name" ? "active" : ""} onClick={() => onSetSort("name", "asc")}>상품명순</button>
                        </div>
                        <ul className="sub-product-list">
                            {pageItem.map((item, id) => (
                                <li key={id}>
                                    <Link to={`/product/${item.id}`}>
                                        <SubCard item={item} />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <ul className="pagination">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <li key={page}>
                                    <button
                                        className={currentPage === page ? "active" : ""}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
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