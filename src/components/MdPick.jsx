import React from 'react'
import { Link } from 'react-router-dom'

const MdPick = ({mdPick}) => {
    return (
        <>
            <h2>MD's Pick!</h2>
            <ul className="md-pick">

                {mdPick.map((md, id) => (
                    <li>
                        <Link to={`/product/${md.id}`}>

                            <div className="img-box">
                                <img src={md.productImages[1]} alt="상품이미지" />
                            </div>
                            <div className="text-box">
                                <h1 className='sub-series-name'>{md.series}</h1>
                                <p className='product-name'>{md.name}</p>
                                <p className='price'>{md.price} 원</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="sub-line"></div>
        </>
    )
}

export default MdPick