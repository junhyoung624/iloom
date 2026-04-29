import React, { useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useCustomWishStore } from '../store/useCustomWishStore';

import "./scss/wishlist.scss";
//import "./scss/mypage.scss";
import { Link, useNavigate } from 'react-router-dom';
import MyPageMenu from './MyPageMenu';
import { Helmet } from 'react-helmet-async';

export default function WishList() {
    const {
        wishlist,
        onRemoveWish,
    } = useProductStore();

    const {
        wishFolders = [],
        onCreateWishFolder,
        onMoveToWishFolder,
        onDeleteWishFolder,
        onRenameWishFolder,
        onRemoveItemsFromWishFolder,
        onClearWishFolderItems
    } = useCustomWishStore();

    //체크된 항목 저장할 변수 (결제하기에 넘겨줄 변수)
    const [checkedItems, setCheckedItems] = useState([]);

    //선택한 상품 관리 버튼 클릭시 사이드바 나타나게
    const [isWishSidebarOpen, setIsWishSidebarOpen] = useState(false);

    //위시 사이드바 상태 (main, moveList, createList)
    const [wishSidebarStep, setWishSidebarStep] = useState("main");
    //커스텀 위시리스트 이름 저장
    const [newFolderName, setNewFolderName] = useState("");
    //커스텀 위시리스트 - 더보기 메뉴 상태 추가
    const [openFolderMenuId, setOpenFolderMenuId] = useState(null);

    //사이드바 종류 분리 - selected/folder
    const [sidebarMode, setSidebarMode] = useState("selected");

    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [editFolderName, setEditFolderName] = useState("");


    const navigate = useNavigate();
    //체크박스 체크 시 실행할 메서드
    //매개값 : 체크된 항목
    const handleChecked = (item) => {

        const key = item.id;

        setCheckedItems((prev) =>
            prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
        )
    }



    //전체 체크 메서드
    const handleAllChecked = (e) => {
        //체크가 되면
        //모든 요소를 checkedItems에 넣고
        //그렇지 않으면 checkedItems 비우기
        if (e.target.checked) {
            const allKeys = wishlist.map((item) => item.id);
            setCheckedItems((prev) => [
                ...new Set([...prev, ...allKeys])
            ]);
        } else {
            const visibleKeys = filteredWishlist.map((item) => item.id);

            setCheckedItems((prev) =>
                prev.filter((id) => !visibleKeys.includes(id))
            );
        }
    }

    //체크된 위시(checkedItems) 전체 삭제
    const handleAllDeleteBtn = () => {
        setCheckedItems([]);
    }

    const [activeFolderId, setActiveFolderId] = useState("all");

    const activeFolder = wishFolders.find(
        (folder) => folder.id === activeFolderId
    );

    const filteredWishlist =
        activeFolderId === "all"
            ? wishlist
            : wishlist.filter((item) =>
                activeFolder?.itemIds.includes(item.id)
            );

    //선택된 항목의 전체 정보 저장할 변수
    const selectedItems = filteredWishlist.filter((item) =>
        checkedItems.includes(item.id)
    );
    const selectedItemIds = selectedItems.map((item) => item.id);





    //컨트롤타워
    //최대 8개만 썸네일로 보여주기
    const visibleSelectedItems = selectedItems.slice(0, 8);

    //8개 초과한 개수
    const extraCount = selectedItems.length - visibleSelectedItems.length;

    return (
        <div className='mypage'>
            <Helmet>
                <title>위시리스트 | iloom</title>
                <meta name="description" content="찜한 상품 목록을 확인하세요." />
            </Helmet>
            <div className="inner">
                <MyPageMenu />
                <div className="content">
                    <div className="page-title">
                        <p>위시리스트</p>
                    </div>
                    <div className="wish-content">

                        {
                            wishlist.length == 0 &&
                            <div className="empty-content-wrap">
                                <div className='show-empty-info'>위시리스트가 비었습니다</div>
                                <div className="show-more-btn"
                                    onClick={() => navigate("/")}>더 알아보기</div>
                            </div>
                        }
                        {wishFolders.length > 0 && (
                            <div className="wish-folder-tabs">

                                {/* 전체 */}
                                <div
                                    className={`wish-folder-tab-item ${activeFolderId === "all" ? "active" : ""
                                        }`}
                                    onClick={() => {
                                        setActiveFolderId("all");
                                        setOpenFolderMenuId(null);
                                        setCheckedItems([]);
                                    }}
                                >
                                    <button
                                        className="wish-folder-tab-btn"
                                        type="button"
                                    >
                                        <span>전체</span>
                                        <div className="wish-folder-preview wish-folder-preview-empty">
                                            <span>ALL</span>
                                        </div>
                                    </button>
                                </div>

                                {/* 폴더들 */}
                                {wishFolders.map((folder) => {
                                    const folderItems = wishlist.filter((item) =>
                                        folder.itemIds.includes(item.id)
                                    );
                                    return (
                                        <div
                                            key={folder.id}
                                            className={`wish-folder-tab-item ${activeFolderId === folder.id ? "active" : ""
                                                }`}
                                            onClick={() => {
                                                setActiveFolderId(folder.id);
                                                setOpenFolderMenuId(null);
                                                setCheckedItems([]);
                                            }}
                                        >
                                            <button
                                                className="wish-folder-tab-btn"
                                            >
                                                <span>{folder.name}</span>

                                                <div className="wish-folder-preview">
                                                    {folderItems.slice(0, 3).map((item) => (
                                                        <img
                                                            key={item.id}
                                                            src={item.productImages[0]}
                                                            alt={item.name}
                                                        />
                                                    ))}
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                className="wish-folder-more-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSidebarMode("folder");
                                                    setSelectedFolderId(folder.id);
                                                    setEditFolderName(folder.name);
                                                    setIsWishSidebarOpen(true);
                                                    setWishSidebarStep("folderMain");
                                                }}
                                            >
                                                ⋯
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {
                            wishlist.length > 0 &&
                            <div className="wish-list-title">
                                <div className="wish-control-left">
                                    <input type="checkbox"
                                        className='wish-check-box'
                                        checked={
                                            filteredWishlist.length > 0 &&
                                            selectedItems.length === filteredWishlist.length
                                        }
                                        onChange={handleAllChecked} />


                                </div>
                                <div className="wish-control-right">
                                    {
                                        selectedItems.length > 0 &&
                                        <div className='wish-control-btn-wrap'>
                                            <div className='wish-control-btn wish-control-btn-ctrl'
                                                onClick={() => {
                                                    setSidebarMode("selected");
                                                    setIsWishSidebarOpen(true);
                                                    setWishSidebarStep("main")
                                                }}>관리</div>
                                            <div className='wish-control-btn wish-control-btn-del'
                                                onClick={handleAllDeleteBtn}>모두 지우기</div>
                                        </div>
                                    }

                                    <div className="checked-wish-area">
                                        <ul className='control-wish-list'>

                                            {
                                                visibleSelectedItems.map((item, id) => (
                                                    <li key={id}
                                                        className='checked-wish-thumbnail'>
                                                        <img src={item.productImages[0]} alt="." />
                                                    </li>
                                                ))
                                            }
                                            {
                                                extraCount > 0 && (
                                                    <li className='extra-wish-count'>+{extraCount}</li>
                                                )
                                            }
                                        </ul>

                                    </div>
                                </div>

                            </div>
                        }

                        <ul className="wish-list">

                            {filteredWishlist.length > 0 && filteredWishlist.map((wish, id) => {
                                return <li key={id} className='wish-item'>
                                    <div className="check-area">
                                        <input
                                            type="checkbox"
                                            className='wish-check-box'
                                            onChange={() => handleChecked(wish)}
                                            checked={checkedItems.includes(wish.id)}
                                        />
                                    </div>
                                    <div className="wish-item-left">

                                        <div className="wish-img-info">
                                            <img src={wish.productImages[0]} alt="." />
                                        </div>
                                        <div className="wish-name-info">
                                            <p className='series-name-in-wish'>{wish.series}</p>
                                            <p className='product-name'>{wish.name}</p>
                                        </div>
                                    </div>

                                    <div className="wish-item-right">
                                        <div className="wish-price-info">
                                            <p>{wish.price} 원</p>
                                        </div>
                                        <div className="wish-button">
                                            <Link to={`/product/${wish.id}`}><div className="detail-btn wish-btn">상세보기</div></Link>
                                            <div className="delete-btn wish-btn"
                                                onClick={() => onRemoveWish(wish.id)}
                                            >삭제</div>
                                        </div>
                                    </div>

                                </li>
                            })


                            }
                        </ul>
                    </div>
                    {/* {
                        wishlist.length > 0 && <div className="wish-delete-all-btn">
                            선택상품삭제
                        </div>
                    } */}

                </div>

            </div>
            {/* 선택 상품 관리 사이드바 */}
            {isWishSidebarOpen && (
                <div
                    className="wish-sidebar-overlay"
                    onClick={() => setIsWishSidebarOpen(false)}
                >
                    <div
                        className="wish-sidebar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="wish-sidebar-header">
                            {wishSidebarStep !== "main" && wishSidebarStep !== "folderMain" && (
                                <button
                                    type="button"
                                    className="wish-sidebar-back"
                                    onClick={() => {
                                        if (wishSidebarStep === "folderCreate") {
                                            setWishSidebarStep("folderMove");
                                        } else {
                                            setWishSidebarStep(
                                                sidebarMode === "folder" ? "folderMain" : "main"
                                            );
                                        }
                                    }}
                                >
                                    ←
                                </button>
                            )}

                            <h3>
                                {sidebarMode === "selected" && wishSidebarStep === "main" && "위시리스트 관리"}
                                {sidebarMode === "selected" && wishSidebarStep === "moveList" && "다른 위시리스트로 이동"}
                                {sidebarMode === "selected" && wishSidebarStep === "createList" && "위시리스트 만들기"}


                                {sidebarMode === "folder" && wishSidebarStep === "folderMain" && "위시리스트 설정"}
                                {sidebarMode === "folder" && wishSidebarStep === "renameFolder" && "이름 바꾸기"}
                                {sidebarMode === "folder" && wishSidebarStep === "folderMove" && "다른 위시리스트로 이동"}

                                <h3>
                                    {sidebarMode === "folder" && wishSidebarStep === "folderMove" && ""}
                                    {sidebarMode === "folder" && wishSidebarStep === "folderCreate" && "위시리스트 만들기"}
                                </h3>
                            </h3>

                            <button
                                type="button"
                                className="wish-sidebar-close"
                                onClick={() => setIsWishSidebarOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="wish-sidebar-content">
                            {wishSidebarStep === "main" && (
                                <>
                                    <p className="wish-sidebar-desc">
                                        선택한 상품 {selectedItems.length}개
                                    </p>

                                    <button
                                        className="wish-sidebar-menu-btn"
                                        onClick={() => setWishSidebarStep("moveList")}
                                    >
                                        다른 위시리스트로 이동
                                        <span>›</span>
                                    </button>

                                    <button
                                        className="wish-sidebar-menu-btn"
                                        onClick={() => setWishSidebarStep("createList")}
                                    >
                                        위시리스트 만들기
                                        <span>›</span>
                                    </button>
                                </>
                            )}

                            {wishSidebarStep === "moveList" && (
                                <>
                                    <p className="wish-sidebar-desc">
                                        이동할 위시리스트를 선택하세요.
                                    </p>

                                    <div className="wish-folder-list">
                                        {wishFolders.length === 0 && (
                                            <p className="wish-folder-empty">
                                                아직 만든 위시리스트가 없습니다.
                                            </p>
                                        )}
                                        {wishFolders.map((folder) => (
                                            <button
                                                key={folder.id}
                                                className="wish-folder-btn"
                                                onClick={() => {
                                                    onMoveToWishFolder(folder.id, selectedItemIds);
                                                    setIsWishSidebarOpen(false);
                                                    setActiveFolderId(folder.id);
                                                    setCheckedItems([]);
                                                }}
                                            >
                                                {folder.name}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="wish-create-btn"
                                        onClick={() => setWishSidebarStep("createList")}
                                    >
                                        + 새 위시리스트 만들기
                                    </button>
                                </>
                            )}

                            {wishSidebarStep === "createList" && (
                                <>
                                    <label className="wish-input-label">
                                        위시리스트 이름
                                    </label>

                                    <input
                                        className="wish-folder-input"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="위시리스트 이름을 적어주세요"
                                    />

                                    <button
                                        className="wish-submit-btn"
                                        onClick={() => {
                                            if (!newFolderName.trim()) return;

                                            onCreateWishFolder(newFolderName);
                                            setNewFolderName("");
                                            setWishSidebarStep("moveList");
                                        }}
                                    >
                                        만들기
                                    </button>
                                </>
                            )}
                            {/* 폴더관리 - 메인 */}
                            {sidebarMode === "folder" && wishSidebarStep === "folderMain" && (() => {
                                const targetFolder = wishFolders.find(
                                    (folder) => folder.id === selectedFolderId
                                );

                                const folderItems = wishlist.filter((item) =>
                                    targetFolder?.itemIds.includes(item.id)
                                );

                                return (
                                    <>
                                        <p className="wish-sidebar-desc">
                                            {targetFolder?.name} · {folderItems.length}개 상품
                                        </p>

                                        <button
                                            className="wish-sidebar-menu-btn"
                                            onClick={() => {
                                                setEditFolderName(targetFolder?.name || "");
                                                setWishSidebarStep("renameFolder");
                                            }}
                                        >
                                            위시리스트 이름 바꾸기
                                            <span>›</span>
                                        </button>

                                        <button
                                            className="wish-sidebar-menu-btn"
                                            onClick={() => {
                                                onRemoveItemsFromWishFolder(
                                                    selectedFolderId,
                                                    targetFolder?.itemIds || []
                                                );
                                                setIsWishSidebarOpen(false);
                                            }}
                                        >
                                            여기에 담은 아이템을 목록에서 삭제하기
                                            <span>›</span>
                                        </button>

                                        <button
                                            className="wish-sidebar-menu-btn"
                                            onClick={() => setWishSidebarStep("folderMove")}
                                        >
                                            다른 위시리스트 폴더로 이동하기
                                            <span>›</span>
                                        </button>

                                        <button
                                            className="wish-sidebar-delete-btn"
                                            onClick={() => {
                                                onDeleteWishFolder(selectedFolderId);

                                                if (activeFolderId === selectedFolderId) {
                                                    setActiveFolderId("all");
                                                }

                                                setIsWishSidebarOpen(false);
                                            }}
                                        >
                                            위시리스트 삭제하기
                                        </button>
                                    </>
                                );
                            })()}
                            {/* 폴더관리 - 이름바꾸기 */}
                            {sidebarMode === "folder" && wishSidebarStep === "renameFolder" && (
                                <>
                                    <label className="wish-input-label">
                                        새 위시리스트 이름
                                    </label>

                                    <input
                                        className="wish-folder-input"
                                        value={editFolderName}
                                        onChange={(e) => setEditFolderName(e.target.value)}
                                        placeholder="위시리스트 이름"
                                    />

                                    <button
                                        className="wish-submit-btn"
                                        onClick={() => {
                                            if (!editFolderName.trim()) return;

                                            onRenameWishFolder(selectedFolderId, editFolderName);
                                            setWishSidebarStep("folderMain");
                                        }}
                                    >
                                        저장하기
                                    </button>
                                </>
                            )}
                            {/* 폴더관리 - 선택한 아이템 다른 폴더로 이동 */}
                            {sidebarMode === "folder" && wishSidebarStep === "folderMove" && (() => {
                                const targetFolder = wishFolders.find(
                                    (folder) => folder.id === selectedFolderId
                                );

                                const itemIdsToMove = targetFolder?.itemIds || [];
                                const movableFolders = wishFolders.filter(
                                    (folder) => folder.id !== selectedFolderId
                                );

                                return (
                                    <>
                                        <p className="wish-sidebar-desc">
                                            이동할 폴더를 선택하세요.
                                        </p>

                                        <div className="wish-folder-list">
                                            {movableFolders.length === 0 && (
                                                <p className="wish-folder-empty">
                                                    이동할 수 있는 다른 위시리스트가 없습니다.
                                                </p>
                                            )}

                                            {movableFolders.map((folder) => (
                                                <button
                                                    key={folder.id}
                                                    className="wish-folder-btn"
                                                    onClick={() => {
                                                        onMoveToWishFolder(folder.id, itemIdsToMove);
                                                        onRemoveItemsFromWishFolder(
                                                            selectedFolderId,
                                                            itemIdsToMove
                                                        );

                                                        setActiveFolderId(folder.id);
                                                        setIsWishSidebarOpen(false);
                                                    }}
                                                >
                                                    {folder.name}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            className="wish-create-btn"
                                            onClick={() => {
                                                setNewFolderName("");
                                                setWishSidebarStep("folderCreate");
                                            }}
                                        >
                                            + 새 위시리스트 만들기
                                        </button>
                                    </>
                                );
                            })()}
                            {/* 폴더관리 - 이동용 새 폴더 만들기 */}
                            {sidebarMode === "folder" && wishSidebarStep === "folderCreate" && (() => {
                                const targetFolder = wishFolders.find(
                                    (folder) => folder.id === selectedFolderId
                                );

                                const itemIdsToMove = targetFolder?.itemIds || [];

                                return (
                                    <>
                                        <label className="wish-input-label">
                                            새 위시리스트 이름
                                        </label>

                                        <input
                                            className="wish-folder-input"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            placeholder="위시리스트 이름을 적어주세요"
                                        />

                                        <button
                                            className="wish-submit-btn"
                                            onClick={() => {
                                                const folderName = newFolderName.trim();
                                                if (!folderName) return;

                                                const newFolderId = onCreateWishFolder(folderName);

                                                onMoveToWishFolder(newFolderId, itemIdsToMove);
                                                onRemoveItemsFromWishFolder(
                                                    selectedFolderId,
                                                    itemIdsToMove
                                                );

                                                setNewFolderName("");
                                                setActiveFolderId(newFolderId);
                                                setIsWishSidebarOpen(false);
                                            }}
                                        >
                                            만들고 이동하기
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
