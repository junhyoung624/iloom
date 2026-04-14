import React from 'react'

const MdPick = () => {
    return (
        <>
            <h2>MD's Pick!</h2>
            <ul className="md-pick">

                {mdPick.map((md, id) => (
                    <li>
                        <Link>

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
        </>
    )
}

export default MdPick