import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import "./scss/footeraccordion.scss";

const menuData = [
    { title: "About", items: "회사소개", link: "companypage" },
    { title: "About", items: "매장안내", link: "store-info" },
    { title: "Support", items: "고객지원", link: "notice" },
    { title: "Support", items: "서비스센터", link: "https://cs.iloom.com/" },
    { title: "Info", items: "이용약관", link: "https://www.iloom.com/policy/termsOfUse.do" },
    { title: "Info", items: "개인정보처리방침", link: "https://www.iloom.com/policy/privacy.do" },
    { title: "Info", items: "윤리신고센터", link: "https://www.kbei.org/whistle/center/?code=fursysgroup" },
];

export default function FooterAccordion() {
    const [openIndex, setOpenIndex] = useState(-1);

    const groupedMenu = useMemo(() => {
        return menuData.reduce((acc, cur) => {
            const found = acc.find((group) => group.title === cur.title);

            const newItem = {
                label: cur.items,
                link: cur.link,
                isExternal: cur.link.startsWith("http"),
            };

            if (found) {
                found.children.push(newItem);
            } else {
                acc.push({
                    title: cur.title,
                    children: [newItem],
                });
            }

            return acc;
        }, []);
    }, []);

    const toggleMenu = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="footer-accordion">
            <div className="footer-left">
                <p className="footer-kicker">당신의 일상이 머무는 모든 곳에,</p>
                <div className="footer-logo">
                    <img src="./images/footer/Logo-303030.png" alt="iloom logo" />
                </div>
                <p className="footer-desc">
                    가구를 넘어 공간의 가치를 만듭니다.
                    <br />
                    당신의 일상이 더 빛나는 곳, 일룸이 함께합니다.
                </p>
            </div>

            <div className="footer-right">
                {groupedMenu.map((menu, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div className="accordion-section" key={menu.title}>
                            <button
                                type="button"
                                className="accordion-header"
                                onClick={() => toggleMenu(index)}
                            >
                                <span>{menu.title}</span>
                                <div className={`arrow ${isOpen ? "open" : ""}`}>
                                    <img src="./images/footer/arrow-icon.png" alt="" />
                                </div>
                            </button>

                            <div className={`accordion-body ${isOpen ? "open" : ""}`}>
                                <ul>
                                    {menu.children.map((item) => (
                                        <li key={item.link}>
                                            {item.isExternal ? (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {item.label}
                                                </a>
                                            ) : (
                                                <Link to={`/${item.link}`}>{item.label}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}