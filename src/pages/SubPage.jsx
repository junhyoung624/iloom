import React from 'react'
import { useProductStore } from '../store/useProductStore'
import { useParams } from 'react-router-dom';
import "./scss/subPage.scss"

const SubPage = () => {
    const { items } = useProductStore();

    const params = useParams();
    const mainCate = params.originalCategory || originalCategory;
    const subCate = params.category2
    const thirdCate = params.category3

    console.log("dd", mainCate, subCate, thirdCate);

    let cateItems = items.filter((item) => {
        // 메인메뉴
        if (mainCate && item.originalCategory !== mainCate) return false;
        if (subCate && item.category2 !== subCate) return false;
        if (thirdCate && item.category3 !== thirdCate) return false;
        return true;
    })

    return (
        <div className='sub-page-wrap'>
            <div className="inner">

                <ul className="sub-tab">

                </ul>
                <div className="product-list-wrap">

                    <ul className="product-list">
                        {cateItems.map((item) => (
                            <li>
                                <div className="img-box">
                                    <img src={item.productImages[0]} alt="상품이미지" />
                                </div>
                                <div className="text-box">
                                    {item.name}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SubPage