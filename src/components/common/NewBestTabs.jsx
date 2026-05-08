import ButtonTabs from './ButtonTabs'

export default function NewBestTabs({ tabs, activeTab, onChange }) {
    return (
        <ButtonTabs
            items={tabs}
            activeKey={activeTab}
            onChange={onChange}
            ariaLabel="product category tabs"
        />
    )
}
