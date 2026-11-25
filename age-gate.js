// SUGAR PLANET | 年齢確認（装飾改訂版）
// R18作品の <head> 内に <script src="../age-gate.js"></script> を追加してください。
// 小説の内容・他のページ・script.js は変更しません。
(() => {
  'use strict';

  const storageKey = 'sugarplanet.age-verified-until';
  const verificationDays = 30;
  const durationMs = verificationDays * 24 * 60 * 60 * 1000;

  // 30日以内にYESと回答済みなら、これまでどおり年齢確認を省略します。
  try {
    const verifiedUntil = Number(localStorage.getItem(storageKey));
    if (Number.isFinite(verifiedUntil) && verifiedUntil > Date.now()) return;
  } catch (_) {
    // 保存できなくても閲覧前に確認は表示します。
  }

  // 年齢確認前に小説本文が一瞬見えないようにします。
  document.documentElement.classList.add('sp-age-pending');

  const style = document.createElement('style');
  style.textContent = `
    html.sp-age-pending body > :not(#sp-age-gate) { visibility: hidden !important; }
    body.sp-age-locked { overflow: hidden; }
    #sp-age-gate {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      padding: clamp(16px, 4vw, 40px);
      background:
        radial-gradient(ellipse 75% 60% at 50% 38%, rgba(255, 234, 241, .37), transparent 88%),
        linear-gradient(140deg, #eeb2cc 0%, #edb3d1 55%, #e4a6c4 100%);
      color: #252a67;
      font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
      visibility: visible !important;
    }
    #sp-age-gate, #sp-age-gate * { box-sizing: border-box; }
    #sp-age-gate .sp-age-card {
      position: relative;
      isolation: isolate;
      flex-shrink: 0;
      width: min(100%, 540px);
      margin: auto;
      padding: clamp(30px, 5vw, 43px) clamp(23px, 5vw, 48px) clamp(29px, 5vw, 38px);
      border: 8px solid rgba(255, 239, 236, .94);
      border-radius: 43px;
      background: #fff7ed;
      box-shadow: 0 18px 37px rgba(129, 54, 89, .20), 0 4px 10px rgba(129, 54, 89, .10);
      text-align: center;
    }
    #sp-age-gate .sp-age-card::before {
      content: "";
      position: absolute;
      inset: 3px;
      border: 2px solid #efb9c8;
      border-radius: 32px;
      pointer-events: none;
      z-index: -1;
    }
    #sp-age-gate .sp-age-site {
      margin: 0 0 14px;
      color: #283bbc;
      font: italic bold 13px/1.5 Georgia, "Times New Roman", serif;
      letter-spacing: .20em;
    }
    #sp-age-gate .sp-age-site::before,
    #sp-age-gate .sp-age-site::after {
      content: "";
      display: inline-block;
      width: clamp(17px, 7vw, 37px);
      height: 1px;
      margin: 0 12px 4px;
      background: #ecc2cd;
      vertical-align: middle;
    }
    #sp-age-gate .sp-age-symbol {
      display: block;
      width: 82px;
      height: 64px;
      margin: 0 auto 10px;
      color: #283bbc;
    }
    #sp-age-gate h2 {
      margin: 0 0 11px;
      color: #283bbc;
      font: bold clamp(22px, 5vw, 31px)/1.2 Georgia, "Times New Roman", serif;
      letter-spacing: .055em;
      overflow-wrap: anywhere;
    }
    #sp-age-gate .sp-age-subtitle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 0 0 24px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .08em;
    }
    #sp-age-gate .sp-age-subtitle::before,
    #sp-age-gate .sp-age-subtitle::after {
      content: "";
      flex: 1;
      max-width: 112px;
      height: 2px;
      background: #efb9c8;
    }
    #sp-age-gate .sp-age-description {
      margin: 0;
      font-size: 13px;
      line-height: 2.05;
      font-weight: 500;
    }
    #sp-age-gate .sp-age-description span { display: block; }
    #sp-age-gate .sp-age-question {
      margin: 22px auto 16px;
      padding: 12px 11px;
      max-width: 414px;
      border-radius: 999px;
      background: #ffe2e9;
      color: #252a67;
      font-size: clamp(15px, 4vw, 18px);
      line-height: 1.5;
      font-weight: 800;
    }
    #sp-age-gate .sp-age-buttons { display: grid; gap: 11px; }
    #sp-age-gate button {
      position: relative;
      width: 100%;
      min-height: 49px;
      padding: 12px 36px;
      border: 2px solid #283bbc;
      border-radius: 999px;
      background: #283bbc;
      color: #fff;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 750;
      line-height: 1.5;
      transition: background-color .18s ease, border-color .18s ease, color .18s ease,
                  transform .18s ease, box-shadow .18s ease;
    }
    #sp-age-gate button::after {
      content: "›";
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-55%);
      font: 30px/1 Arial, sans-serif;
    }
    #sp-age-gate #sp-age-yes:hover {
      background: #3854e8;
      border-color: #3854e8;
      box-shadow: 0 6px 14px rgba(40, 59, 188, .22);
      transform: translateY(-2px);
    }
    #sp-age-gate button.sp-age-no { background: transparent; color: #283bbc; }
    #sp-age-gate button.sp-age-no:hover { background: #fce7ed; }
    #sp-age-gate button:focus-visible { outline: 3px solid #ba3972; outline-offset: 3px; }
    #sp-age-gate .sp-age-note {
      margin: 22px 0 0;
      color: #666c8c;
      font-size: 11px;
      line-height: 1.8;
    }
    @media (max-width: 480px) {
      #sp-age-gate .sp-age-card { border-width: 6px; border-radius: 30px; }
      #sp-age-gate .sp-age-card::before { border-radius: 20px; }
      #sp-age-gate .sp-age-site { font-size: 11px; }
      #sp-age-gate .sp-age-site::before, #sp-age-gate .sp-age-site::after { margin-inline: 8px; }
      #sp-age-gate .sp-age-subtitle { margin-bottom: 18px; }
      #sp-age-gate .sp-age-description { font-size: 12px; }
      #sp-age-gate .sp-age-question { margin-top: 17px; }
      #sp-age-gate .sp-age-note { font-size: 10px; }
    }
    @media (prefers-reduced-motion: reduce) {
      #sp-age-gate button { transition: none; }
      #sp-age-gate #sp-age-yes:hover { transform: none; }
    }
  `;
  document.head.appendChild(style);

  function showAgeGate() {
    const main = document.querySelector('main');
    const previousAriaHidden = main?.getAttribute('aria-hidden');
    const previousInert = main?.inert;
    if (main) {
      main.inert = true;
      main.setAttribute('aria-hidden', 'true');
    }

    const gate = document.createElement('section');
    gate.id = 'sp-age-gate';
    gate.tabIndex = -1;
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'sp-age-title');
    gate.setAttribute('aria-describedby', 'sp-age-description');
    gate.innerHTML = `
      <div class="sp-age-card">
        <p class="sp-age-site">SUGAR PLANET</p>
        <svg class="sp-age-symbol" viewBox="0 0 92 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M46 21C34 13 19 14 10 18V55c15-6 27-3 36 4 9-7 21-10 36-4V18c-9-4-24-5-36 3Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M46 21v38M14 22v29M78 22v29" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M46 31c-2-5-9-6-12-2-4 6 6 12 12 17 6-5 16-11 12-17-3-4-10-3-12 2Z" fill="currentColor"/>
          <path d="m4 18 2-7 2 7 7 2-7 2-2 7-2-7-7-2 7-2ZM83 8l2-6 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="currentColor"/>
        </svg>
        <h2 id="sp-age-title">AGE VERIFICATION</h2>
        <p class="sp-age-subtitle">年齢確認</p>
        <p class="sp-age-description" id="sp-age-description">
          <span>この先には成人向け表現を含む作品があります。</span>
          <span>18歳未満の方は閲覧をご遠慮ください。</span>
        </p>
        <p class="sp-age-question">あなたは18歳以上ですか？</p>
        <div class="sp-age-buttons">
          <button type="button" id="sp-age-yes">YES — 18歳以上です</button>
          <button type="button" class="sp-age-no" id="sp-age-no">NO — 18歳未満です</button>
        </div>
        <p class="sp-age-note">※ 確認後、同じブラウザでは30日間この画面を省略します。</p>
      </div>
    `;
    document.body.appendChild(gate);
    document.body.classList.add('sp-age-locked');

    const yesButton = gate.querySelector('#sp-age-yes');
    const noButton = gate.querySelector('#sp-age-no');
    // 最初はダイアログ自体にフォーカスし、マウス操作前のフォーカス枠を防ぎます。
    gate.focus({ preventScroll: true });

    yesButton.addEventListener('click', () => {
      try {
        localStorage.setItem(storageKey, String(Date.now() + durationMs));
      } catch (_) {
        // 保存できなくても、このページは閲覧できます。
      }
      gate.remove();
      document.documentElement.classList.remove('sp-age-pending');
      document.body.classList.remove('sp-age-locked');
      if (main) {
        main.inert = previousInert;
        if (previousAriaHidden === null) main.removeAttribute('aria-hidden');
        else main.setAttribute('aria-hidden', previousAriaHidden);
      }
    });

    noButton.addEventListener('click', () => {
      // novels/ 内の作品からサイトHOMEへ戻ります。
      window.location.replace('../');
    });

    // キーボードで年齢確認ダイアログの外へ移動しないようにします。
    gate.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && (document.activeElement === yesButton || document.activeElement === gate)) {
        event.preventDefault();
        noButton.focus();
      } else if (!event.shiftKey && document.activeElement === noButton) {
        event.preventDefault();
        // 最初はダイアログ自体にフォーカスし、マウス操作前のフォーカス枠を防ぎます。
    gate.focus({ preventScroll: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAgeGate, { once: true });
  } else {
    showAgeGate();
  }
})();
