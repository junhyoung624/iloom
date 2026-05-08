import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import "./scss/furnitureList.scss"

export default function FurnitureList() {
    const furnitureList = [
        { id: "1", key: "소파", image: "./images/furnitureList/FList01.png" },
        { id: "2", key: "의자", image: "./images/furnitureList/FList02.png" },
        { id: "3", key: "테이블", image: "./images/furnitureList/FList03.png" },
        { id: "4", key: "침대", image: "./images/furnitureList/FList04.png" },
        { id: "5", key: "수납", image: "./images/furnitureList/FList05.png" },
        { id: "6", key: "조명", image: "./images/furnitureList/FList06.png" },
    ]

    const [visibleItems, setVisibleItems] = useState([])
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    furnitureList.forEach((_, i) => {
                        setTimeout(() => {
                            setVisibleItems(prev => [...prev, i])
                        }, i * 120)
                    })
                    observer.disconnect()
                }
            },
            { threshold: 0.2 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section className="furniture-list-section" ref={sectionRef}>
            <div className="furniture-list">
                <div className="inner">
                    <div className="furniture-list-title">
                        <span>FURNITURE CATEGORY</span>
                    </div>

                    <ul className="furniture-list-grid">
                        {furnitureList.map((item, index) => (
                            <li
                                key={item.id}
                                className={`furniture-list-item ${visibleItems.includes(index) ? 'visible' : ''}`}
                            >
                                <div className="furniture-item">
                                    <Link to={`/furniturepage?furniture=${item.key}`}>
                                        <div className="furniture-img-box">
                                            <img src={item.image} alt={item.key} />
                                        </div>
                                        <p>{item.key}</p>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}