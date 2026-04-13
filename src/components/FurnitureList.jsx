import React from 'react'
import "./scss/furnitureList.scss"
import { Link } from 'react-router-dom'

export default function FurnitureList() {

    const FurnitureList = [
        { id: "1", key: "쇼파", image: "./images/furnitureList/FList01.png" },
        { id: "2", key: "의자", image: "./images/furnitureList/FList02.png" },
        { id: "3", key: "테이블", image: "./images/furnitureList/FList03.png" },
        { id: "4", key: "침대", image: "./images/furnitureList/FList04.png" },
        { id: "5", key: "책상/서랍", image: "./images/furnitureList/FList05.png" },
        { id: "6", key: "조명", image: "./images/furnitureList/FList06.png" },
    ]
    return (
        <div className='furniture-list'>
            <div className="inner">
                <ul>
                    {FurnitureList.map((item, id) => (
                        <li key={id}>
                            <div className='furniture-item'>
                                <Link to={`/furniture/${item.id}`}>
                                    <img src={item.image} alt={item.key} />
                                    <p>{item.key}</p>
                                </Link>
                            </div>
                        </li>
                    ))}

                </ul>
            </div>
        </div>
    )
}
