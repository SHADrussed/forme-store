import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const products = [
  { id: 'daily', name: 'Daily / 01', category: 'Рюкзаки', type: 'Городской рюкзак', color: 'Терракота', price: '12 900', image: 'daypack.jpg', alt: 'Коричневый кожаный рюкзак на светлом фоне', description: 'Выразительная фактура и мягкий силуэт. Визуальная идея рюкзака для привычных маршрутов и спонтанных планов.', note: 'Стоковая фотография Wiser by the Mile. Иллюстрация концепции, не товар FORME.' },
  { id: 'weekend', name: 'Weekend / 02', category: 'Сумки', type: 'Повседневный шоппер', color: 'Натуральный', price: '4 900', image: 'tote.jpg', alt: 'Светлая текстильная сумка на деревянной скамье', description: 'Всё необходимое — и немного места для спонтанности. Идея лёгкой сумки для города, книжного и выходных.', note: 'Стоковая фотография Lex Sirikiat. Иллюстрация концепции, не товар FORME.' },
  { id: 'pocket', name: 'Pocket / 03', category: 'Аксессуары', type: 'Органайзер для мелочей', color: 'Оливковый', price: '2 900', image: 'pouch.svg', alt: 'Оливковый органайзер с молнией — авторская иллюстрация', description: 'Маленькие вещи заслуживают своего места. Концепт компактного органайзера, который легко взять с собой.', note: 'Авторская SVG-иллюстрация. Демонстрационный товар.' },
];
const filters = ['Всё', 'Сумки', 'Рюкзаки', 'Аксессуары'];
function Icon({ name, ...props }) {
  const paths = { arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>, diagonal: <path d="M5 19 19 5M5 5h14v14"/>, heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>, close: <path d="m6 6 12 12M6 18 18 6"/>, menu: <path d="M4 8h16M4 16h16"/>, plus: <path d="M12 5v14M5 12h14"/>, check: <path d="m5 12 4 4L19 6"/> };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
function App() {
  const [filter, setFilter] = useState('Всё');
  const [favorites, setFavorites] = useState([]);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const dialog = useRef(null);
  const menuButton = useRef(null);
  const shown = products.filter(p => filter === 'Всё' || (filter === 'Избранное' ? favorites.includes(p.id) : p.category === filter));
  useEffect(() => { if (selected) dialog.current.showModal(); }, [selected]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    const closeMenu = e => { if (e.key === 'Escape' && menu) { setMenu(false); menuButton.current.focus(); } };
    window.addEventListener('keydown', closeMenu); return () => window.removeEventListener('keydown', closeMenu);
  }, [menu]);
  function toggleFavorite(p) {
    const exists = favorites.includes(p.id);
    setFavorites(exists ? favorites.filter(id => id !== p.id) : [...favorites, p.id]);
    setNotice(`${p.name} ${exists ? 'удалён из избранного' : 'добавлен в избранное'}`);
  }
  function goFavorites() { setFilter('Избранное'); setMenu(false); document.getElementById('collection').scrollIntoView({ behavior: 'smooth' }); }
  return <>
    <a className="skip-link" href="#main">Перейти к содержимому</a>
    <div className="announcement"><span>МЕНЬШЕ ЛИШНЕГО. БОЛЬШЕ ВАШЕГО.</span><span>DEMO / CONCEPT — 2026</span></div>
    <header className="header">
      <a className="wordmark" href="#" aria-label="FORME — на главную">forme<span>®</span></a>
      <nav className="desktop-nav" aria-label="Основная навигация"><a href="#collection">Коллекция</a><a href="#philosophy">Философия</a><a href="#details">В деталях</a><a href="#contact">Контакты</a></nav>
      <div className="header-actions"><button className="favorite-link" onClick={goFavorites} aria-label={`Избранное, товаров: ${favorites.length}`}><Icon name="heart"/><span className="favorite-label">Избранное</span><span className="count">{favorites.length}</span></button><button ref={menuButton} className="menu-button icon-button" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'}/></button></div>
      {menu && <nav id="mobile-menu" className="mobile-nav" aria-label="Мобильная навигация">{[['collection','Коллекция'],['philosophy','Философия'],['details','В деталях'],['contact','Контакты']].map(([id,label]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{label}<Icon name="arrow"/></a>)}</nav>}
    </header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="tiny-line"/> EVERYDAY ESSENTIALS</p><h1 id="hero-title">В своём<br/><em>ритме.</em></h1><p className="hero-description">Сумки и аксессуары для жизни,<br className="desktop-break"/> в которой есть место вам.</p><a className="button dark" href="#collection">Найти свою форму<Icon name="arrow"/></a><div className="hero-footnote"><span>01 — 03</span><span>Простые формы.<br/>Непростое внимание к деталям.</span></div></div>
        <div className="hero-visual"><img src="/images/daypack.jpg" alt="Кожаный рюкзак терракотового оттенка — визуальный референс коллекции" fetchPriority="high"/><span className="visual-label">THE EVERYDAY EDIT / 01</span><span className="vertical-note">ФОРМА СЛЕДУЕТ ЗА ВАШИМ ДНЁМ</span><button className="hero-product" onClick={() => setSelected(products[0])}><span><small>ЗНАКОМЬТЕСЬ</small><strong>Daily / 01</strong></span><span className="circle-arrow"><Icon name="diagonal"/></span></button></div>
      </section>
      <div className="manifesto-strip"><span>На каждый день</span><span aria-hidden="true">✳</span><span>Вне суеты</span><span aria-hidden="true">✳</span><span>В вашем характере</span><span aria-hidden="true">✳</span><span className="strip-last">FORME ESSENTIALS</span></div>
      <section className="collection section" id="collection" aria-labelledby="collection-title"><div className="section-heading"><div><p className="eyebrow">01 / КОЛЛЕКЦИЯ</p><h2 id="collection-title">Ваши новые <em>спутники.</em></h2></div><p className="heading-aside">Для больших планов<br/>и маленьких ритуалов.</p></div>
        <div className="filter-row"><div className="filters" aria-label="Категории товаров">{filters.map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}{item === 'Всё' && <sup>03</sup>}</button>)}{filter === 'Избранное' && <button aria-pressed="true">Избранное</button>}</div><span className="results-count" role="status">{String(shown.length).padStart(2, '0')} / МОДЕЛИ</span></div>
        <div className="product-grid">{shown.map((p, i) => <article className={`product product-${p.id}`} key={p.id}><div className="product-image"><button className="product-open" onClick={() => setSelected(p)} aria-label={`Подробнее: ${p.name}`}><img src={`/images/${p.image}`} alt={p.alt} loading="lazy"/><span className="quick-view">Рассмотреть <Icon name="plus"/></span></button><span className="product-tag">{p.id === 'pocket' ? 'CONCEPT OBJECT' : 'THE EVERYDAY EDIT'}</span><button className={`save-button icon-button ${favorites.includes(p.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(p)} aria-label={`${favorites.includes(p.id) ? 'Убрать из избранного' : 'Добавить в избранное'}: ${p.name}`} aria-pressed={favorites.includes(p.id)}><Icon name="heart"/></button></div><div className="product-info"><div><button className="product-name" onClick={() => setSelected(p)}>{p.name}</button><p>{p.type}</p></div><span className="price">{p.price} ₽</span></div><p className="color"><span style={{background: ['#a36548','#d7c8ab','#60604b'][products.indexOf(p)]}}/>{p.color}</p></article>)}</div>
        {!shown.length && <div className="empty-state"><Icon name="heart"/><h3>Здесь будут ваши находки</h3><p>Нажмите на сердечко у понравившейся модели.</p><button className="text-link" onClick={() => setFilter('Всё')}>Вернуться к коллекции <Icon name="arrow"/></button></div>}
        <p className="demo-note">Демонстрационная коллекция. Названия и цены условные; фотографии — визуальные референсы.</p>
      </section>
      <section className="philosophy" id="philosophy" aria-labelledby="philosophy-title"><div className="story-image"><img src="/images/linen.jpg" loading="lazy" alt="Крупный план фактуры светлой текстильной сумки"/><span>ТАКТИЛЬНОСТЬ / ПРОСТОТА / ХАРАКТЕР</span></div><div className="story-copy"><p className="eyebrow">02 / ФИЛОСОФИЯ FORME</p><h2 id="philosophy-title">Не больше вещей.<br/><em>Больше смысла.</em></h2><p>Утренний кофе. Знакомая улица. Поездка без плана. Нам близки вещи, которые становятся частью этих моментов.</p><p>FORME — концепция повседневных аксессуаров: спокойные оттенки, понятные формы и внимание к тому, что вы берёте с собой.</p><a className="text-link" href="#details">Красота в деталях <Icon name="arrow"/></a><span className="story-sign">f.</span></div></section>
      <section id="details" className="section details" aria-labelledby="details-title"><div className="section-heading"><div><p className="eyebrow">03 / ОСОЗНАННЫЙ ДИЗАЙН</p><h2 id="details-title">Продумано <em>для жизни.</em></h2></div></div><div className="benefit-grid"><article><span className="benefit-number">01</span><h3>Ничего лишнего</h3><p>Лаконичные силуэты, которые легко вписать в повседневный гардероб.</p></article><article><span className="benefit-number">02</span><h3>Всё на своём месте</h3><p>Вместительная сумка, городской рюкзак и органайзер для самых важных мелочей.</p></article><article><span className="benefit-number">03</span><h3>Тактильный характер</h3><p>Тёплая палитра и выразительные фактуры — основа визуального языка коллекции.</p></article></div></section>
      <section className="contact" id="contact" aria-labelledby="contact-title"><div><p className="eyebrow">ДАВАЙТЕ ЗНАКОМИТЬСЯ</p><h2 id="contact-title">Хорошие вещи<br/>начинаются <em>с разговора.</em></h2></div><div className="contact-right"><p>Здесь мог бы начаться ваш следующий любимый бренд.</p><button className="button light" onClick={() => setSelected('contact')}>Связаться с FORME <Icon name="diagonal"/></button><span>DEMO — сообщения не отправляются</span></div></section>
    </main>
    <footer><div className="footer-top"><a className="wordmark" href="#" aria-label="FORME — наверх">forme<span>®</span></a><p>Меньше лишнего.<br/>Больше вашего.</p><nav aria-label="Навигация в подвале"><a href="#collection">Коллекция</a><a href="#philosophy">О концепции</a><a href="#contact">Контакты</a></nav><a className="back-top" href="#">Наверх <Icon name="diagonal"/></a></div><div className="footer-bottom"><span>© 2026 FORME · DEMO / CONCEPT</span><span>Вымышленный бренд. Учебная витрина, без продаж.</span><a href="/credits.html">Источники изображений ↗</a></div></footer>
    <div className="toast" role="status">{notice && <><Icon name="check"/>{notice}</>}</div>
    <dialog aria-label={selected === 'contact' ? 'О концепте FORME' : selected?.name || 'Просмотр модели'} ref={dialog} className={`modal ${selected === 'contact' ? 'contact-modal' : ''}`} onClose={() => setSelected(null)} onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}><button className="modal-close icon-button" aria-label="Закрыть окно" onClick={() => dialog.current.close()}><Icon name="close"/></button>{selected === 'contact' ? <div className="contact-dialog"><p className="eyebrow">FORME / CONCEPT</p><h2>Начнём <em>с идеи.</em></h2><p>Это демонстрационный сайт вымышленного бренда. Здесь нет реального магазина, адреса или службы поддержки.</p><p>Для коммерческого проекта в этом разделе можно подключить вашу почту, мессенджер или форму обратной связи.</p><button className="button dark" onClick={() => dialog.current.close()}>Понятно <Icon name="check"/></button></div> : selected && <div className="product-dialog"><img src={`/images/${selected.image}`} alt={selected.alt}/><div className="dialog-copy"><p className="eyebrow">FORME / DEMO COLLECTION</p><h2>{selected.name}</h2><p className="dialog-type">{selected.type} · {selected.color}</p><p>{selected.description}</p><p className="dialog-price">{selected.price} ₽ <small>Условная цена</small></p><button className="button dark" onClick={() => toggleFavorite(selected)}><Icon name="heart"/>{favorites.includes(selected.id) ? 'Убрать из избранного' : 'Сохранить в избранное'}</button><p className="demo-note">{selected.note} Покупка недоступна.</p></div></div>}</dialog>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);


