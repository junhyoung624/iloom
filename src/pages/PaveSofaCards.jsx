import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import SubCard from '../components/SubCard'
import "./scss/pavesofacard.scss"

const colorLabels = {
    '5Z1': '5Z1',
    '6A2L': '6A2L',
}

export default function PaveSofaCards() {
    const { items } = useProductStore()

    const sofaCards = useMemo(() => {
        const targetProducts = items.filter((item) => {
            const isPave = item.series === '파베'
            const isSofa = item.category2 === '소파'
            const isThreeOrFour =
                item.name.includes('3인') || item.name.includes('4인')

            return isPave && isSofa && isThreeOrFour
        })

        return targetProducts.flatMap((product) => {
            const colorOption = product.options?.find((option) => option.name === '색상')
            const colors = colorOption?.values || []

            return colors.map((colorCode) => {
                const colorImage =
                    product.productImages?.find((img) => img.includes(colorCode)) ||
                    product.productImages?.[1] ||
                    product.productImages?.[0]

                return {
                    ...product,

                    // ✅ 절대 id 바꾸지 말기
                    // 상세페이지가 productData.find(p => p.id === id)로 찾기 때문
                    id: product.id,

                    // ✅ 카드 구분용은 따로만 사용
                    cardKey: `${product.id}-${colorCode}`,

                    color: colorCode,
                    colorName: colorLabels[colorCode] || colorCode,

                    // SubCard 기준:
                    // productImages[1] = 기본 이미지
                    // productImages[0] = hover 이미지
                    productImages: [
                        product.productImages?.[0],
                        colorImage,
                    ],
                }
            })
        })
    }, [items])

    return (
        <section className="pave-sofa-section">
            <div className="inner">
                <div className="pave-sofa-grid">
                    {sofaCards.slice(0, 4).map((item) => (
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