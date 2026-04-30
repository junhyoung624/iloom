import { create } from "zustand";

const syncWishFoldersToFirestore = async (wishFolders) => {
    const { useAuthStore } = await import("./useAuthStore");
    const user = useAuthStore.getState().user;

    if (!user?.uid) return;

    const { doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("../firebase/firebase");
    const userRef = doc(db, "people", user.uid);

    await setDoc(userRef, { wishFolders }, { merge: true });
};

export const useCustomWishStore = create((set, get) => ({
    wishFolders: [],

    fetchWishFolders: async (user) => {
        if (!user?.uid) {
            set({ wishFolders: [] });
            return;
        }

        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../firebase/firebase");
        const userRef = doc(db, "people", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();

        set({ wishFolders: data?.wishFolders || [] });
    },

    clearWishFolders: () => set({ wishFolders: [] }),

    onCreateWishFolder: (folderName) => {
        const newFolder = {
            id: crypto.randomUUID(),
            name: folderName,
            itemIds: [],
        };

        const nextWishFolders = [...get().wishFolders, newFolder];
        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);

        return newFolder.id;
    },

    onMoveToWishFolder: (folderId, itemIds) => {
        const nextWishFolders = get().wishFolders.map((folder) =>
            folder.id === folderId
                ? {
                    ...folder,
                    itemIds: [...new Set([...folder.itemIds, ...itemIds])],
                }
                : folder
        );

        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);
    },

    onDeleteWishFolder: (folderId) => {
        const nextWishFolders = get().wishFolders.filter(
            (folder) => folder.id !== folderId
        );

        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);
    },

    onRenameWishFolder: (folderId, newName) => {
        const nextWishFolders = get().wishFolders.map((folder) =>
            folder.id === folderId ? { ...folder, name: newName } : folder
        );

        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);
    },

    onRemoveItemsFromWishFolder: (folderId, itemIds) => {
        const nextWishFolders = get().wishFolders.map((folder) =>
            folder.id === folderId
                ? {
                    ...folder,
                    itemIds: folder.itemIds.filter((id) => !itemIds.includes(id)),
                }
                : folder
        );

        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);
    },

    onClearWishFolderItems: (folderId) => {
        const nextWishFolders = get().wishFolders.map((folder) =>
            folder.id === folderId ? { ...folder, itemIds: [] } : folder
        );

        set({ wishFolders: nextWishFolders });
        syncWishFoldersToFirestore(nextWishFolders);
    },
}));
