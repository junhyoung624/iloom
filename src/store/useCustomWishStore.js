import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCustomWishStore = create(
    persist(
        (set, get) => ({

            //커스텀 위시리스트
            //위시리스트 폴더
            wishFolders: [],

            //위시리스트 폴더 생성, 이동, 삭제
            onCreateWishFolder: (folderName) => {
                const newFolder = {
                    id: crypto.randomUUID(),
                    name: folderName,
                    itemIds: [],
                };

                set((state) => ({
                    wishFolders: [...state.wishFolders, newFolder],
                }));

                return newFolder.id;
            },

            onMoveToWishFolder: (folderId, itemIds) => {
                set((state) => ({
                    wishFolders: state.wishFolders.map((folder) =>
                        folder.id === folderId
                            ? {
                                ...folder,
                                itemIds: [...new Set([...folder.itemIds, ...itemIds])],
                            }
                            : folder
                    ),
                }));
            },

            onDeleteWishFolder: (folderId) => {
                set((state) => ({
                    wishFolders: state.wishFolders.filter(
                        (folder) => folder.id !== folderId
                    ),
                }));
            },

            // 위시리스트 폴더 이름 변경
            onRenameWishFolder: (folderId, newName) => {
                set((state) => ({
                    wishFolders: state.wishFolders.map((folder) =>
                        folder.id === folderId
                            ? { ...folder, name: newName }
                            : folder
                    ),
                }));
            },

            // 특정 폴더에서 상품 제거
            onRemoveItemsFromWishFolder: (folderId, itemIds) => {
                set((state) => ({
                    wishFolders: state.wishFolders.map((folder) =>
                        folder.id === folderId
                            ? {
                                ...folder,
                                itemIds: folder.itemIds.filter(
                                    (id) => !itemIds.includes(id)
                                ),
                            }
                            : folder
                    ),
                }));
            },

            // 특정 폴더의 모든 상품 제거
            onClearWishFolderItems: (folderId) => {
                set((state) => ({
                    wishFolders: state.wishFolders.map((folder) =>
                        folder.id === folderId
                            ? { ...folder, itemIds: [] }
                            : folder
                    ),
                }));
            },



        }),
        {
            name: "custom-wish-storage"

        }
    )
);