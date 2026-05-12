import BaseTabs from './BaseTabs'

const normalizeItems = (items) =>
    items.map((item) =>
        typeof item === 'string'
            ? { key: item, label: item }
            : { key: item.key ?? item.value ?? item.label, ...item }
    )

export default function ButtonTabs({
    items,
    activeKey,
    onChange,
    className = '',
    ariaLabel,
}) {
    const tabItems = normalizeItems(items)

    return (
        <BaseTabs
            items={tabItems}
            activeKey={activeKey}
            className={className}
            ariaLabel={ariaLabel}
            renderItem={(item, { active, className: controlClassName }) => (
                <button
                    type="button"
                    className={controlClassName}
                    aria-pressed={active}
                    onClick={() => onChange(item.key)}
                >
                    {item.label}
                </button>
            )}
        />
    )
}
