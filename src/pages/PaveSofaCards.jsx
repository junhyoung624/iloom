import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import SubCard from '../components/SubCard'
import "./scss/pavesofacard.scss"

export default function PaveSofaCards() {
    const { items } = useProductStore()

    const sofaCards = useMemo(() => {
        const targets = [
            (item) => item.series === '파베' && item.category2 === '소파' && item.name.includes('3인'),
            (item) => item.series === '파베' && item.category2 === '소파' && item.name.includes('4인'),
            (item) => item.series === '파베' && item.name.includes('스툴'),
        ]

        return targets
            .map((matcher) => items.find(matcher))
            .filter(Boolean)
            .map((product) => ({
                ...product,
                id: product.id,
                cardKey: product.id,
                productImages: [
                    product.productImages?.[0],
                    product.productImages?.[1],
                ],
            }))
    }, [items])

    return (
        <section className="pave-sofa-section">
            <div className="inner">
                <div className="pave-sofa-grid">
                    {sofaCards.map((item) => (
                        <Link
                            key={item.cardKey}
                            to={`/product/${item.id}`}
                            className="pave-sofa-card-link"
                        >
                            <SubCard item={item} />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}