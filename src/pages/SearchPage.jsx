import React from 'react'
import { useProductStore } from '../store/useProductStore'

export default function SearchPage() {
  const { items, searchWordAll } = useProductStore();

  let cateItems = items;
  if (searchWordAll) {
    const lowerWord = searchWordAll.toLowerCase();
    cateItems = items.filter((i) =>
      i.name.toLowerCase().includes(lowerWord))
  }
  console.log("sdfsff", cateItems)
  return (
    <div>
      {cateItems.map((m) =>
        <>
          <div>{m.name}</div>
        </>
      )}
    </div>
  )
}


