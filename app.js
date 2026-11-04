'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Keep navigation and dialogs usable with the keyboard and on touchscreens.
const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const requestDialog = $('#request-dialog');
const galleryDialog = $('#gallery-dialog');
let previousFocus;
function openDialog(dialog) {
  previousFocus = document.activeElement;
  setMenu(false);
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeDialog(dialog) {
  dialog.close();
}
$$('dialog').forEach(dialog => {
  $('[data-close-dialog]', dialog).addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (previousFocus && !previousFocus.closest('[inert]')) previousFocus.focus();
    else menuToggle.focus();
  });
});
$$('[data-open-request]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.material) $('#material').value = button.dataset.material;
  $('#copy-status').textContent = '';
  openDialog(requestDialog);
}));

// Native details retain useful behavior even when JavaScript is unavailable.
$$('.service').forEach(service => service.addEventListener('toggle', () => {
  if (!service.open) return;
  $$('.service').forEach(other => { if (other !== service) other.open = false; });
  const image = $('#service-image');
  image.src = service.dataset.image;
  image.alt = service.dataset.alt;
}));

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let visible = 0;
  $$('.work-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) visible++;
  });
  $('.gallery-status').textContent = `Показано робіт: ${visible}`;
}));

const gallery = [
  { image: 'assets/work/older-2.jpg', title: 'Геометрія шва', alt: 'Зварний шов з рівномірним рельєфом зблизька', source: 'https://www.olx.ua/d/uk/obyavlenie/zvaryuvannya-argonom-tig-remont-nerzhavyki-alyumnyu-stal-IDZVKvC.html' },
  { image: 'assets/work/instagram-3.jpg', title: 'Бак для опалення', alt: 'Виготовлений металевий бак для опалення в майстерні KOLOS TIG', source: 'https://www.instagram.com/kolos.tig/p/DeOrWaziLXO/' },
  { image: 'assets/work/instagram-11.jpg', title: 'Інформаційна стійка', alt: 'Металева інформаційна стійка, виготовлена в майстерні KOLOS TIG', source: 'https://www.instagram.com/kolos.tig/p/Db-GcSLCFna/' }
];
let galleryIndex = 0;
function showGallery(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const item = gallery[galleryIndex];
  $('#gallery-image').src = item.image;
  $('#gallery-image').alt = item.alt;
  $('#gallery-title').textContent = item.title;
  $('#gallery-source').href = item.source;
  $('#gallery-count').textContent = `0${galleryIndex + 1} / 0${gallery.length}`;
}
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  showGallery(Number(button.dataset.gallery));
  openDialog(galleryDialog);
}));
$('#gallery-prev').addEventListener('click', () => showGallery(galleryIndex - 1));
$('#gallery-next').addEventListener('click', () => showGallery(galleryIndex + 1));
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

// A prepared message is copied locally; no personal data or message is sent.
$('#request-form').addEventListener('submit', async event => {
  event.preventDefault();
  const description = $('#task-description').value.trim();
  if (description.length < 10) {
    $('#task-description').setCustomValidity('Опишіть задачу хоча б у 10 символах.');
    $('#task-description').reportValidity();
    return;
  }
  const message = `Вітаю, KOLOS TIG!\n\nМатеріал: ${$('#material').value}.\nЗадача: ${description}\n\nДодам фото деталі. Підкажіть, будь ласка, можливість виконання, орієнтовну вартість і терміни.`;
  $('#prepared-request').value = message;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(message);
    $('#manual-copy').hidden = true;
    $('#copy-status').textContent = 'Скопійовано. Відкрийте Instagram, вставте запит і додайте фото.';
  } catch {
    $('#manual-copy').hidden = false;
    $('#copy-status').textContent = 'Скопіюйте готовий текст нижче та надішліть його в Instagram.';
    $('#prepared-request').focus();
    $('#prepared-request').select();
  }
});
$('#task-description').addEventListener('input', () => {
  $('#task-description').setCustomValidity('');
  $('#copy-status').textContent = '';
  $('#manual-copy').hidden = true;
});
$('#material').addEventListener('change', () => {
  $('#copy-status').textContent = '';
  $('#manual-copy').hidden = true;
});
$('#year').textContent = new Date().getFullYear();
