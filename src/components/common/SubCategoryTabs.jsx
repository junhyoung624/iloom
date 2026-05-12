import { Link } from 'react-router-dom'
import BaseTabs from './BaseTabs'

export default function SubCategoryTabs({ items }) {
    const activeItem = items.find((item) => item.active)

    return (
        <BaseTabs
            items={items}
            activeKey={activeItem?.to}
            ariaLabel="sub category tabs"
            renderItem={(item, { className }) => (
                <Link to={item.to} className={className}>
                    {item.label}
                </Link>
            )}
        />
    )
}
