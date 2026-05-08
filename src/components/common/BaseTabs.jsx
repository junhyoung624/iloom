import './BaseTabs.scss'

const getTabKey = (item) => item.key ?? item.value ?? item.to ?? item.label

export default function BaseTabs({
    items,
    activeKey,
    className = '',
    ariaLabel = 'tabs',
    renderItem,
}) {
    return (
        <ul className={`base-tabs ${className}`.trim()} aria-label={ariaLabel}>
            {items.map((item) => {
                const key = getTabKey(item)
                const isActive = item.active ?? key === activeKey

                return (
                    <li
                        key={key}
                        className={`base-tabs__item ${isActive ? 'is-active' : ''}`}
                    >
                        {renderItem(item, {
                            active: isActive,
                            className: 'base-tabs__control',
                        })}
                    </li>
                )
            })}
        </ul>
    )
}
