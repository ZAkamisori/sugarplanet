// SUGAR PLANET: 成人向け小説のみに読み込ませる年齢確認
// R18作品の <head> に <script src="../age-gate.js"></script> を追加してください。
(() => {
  'use strict';

  const storageKey = 'sugarplanet.age-verified-until';
  const verificationDays = 30;
  const durationMs = verificationDays * 24 * 60 * 60 * 1000;

  // 同じブラウザで30日以内にYESを選んでいれば確認を省略します。
  try {
    const verifiedUntil = Number(localStorage.getItem(storageKey));
    if (Number.isFinite(verifiedUntil) && verifiedUntil > Date.now()) return;
  } catch (_) {
    // 保存機能が使えない場合も、一度は確認画面を表示します。
  }

  // 年齢確認画面が表示される前に本文が一瞬見えることを防ぎます。
  document.documentElement.classList.add('sp-age-pending');

  const style = document.createElement('style');
  style.textContent = `
    html.sp-age-pending body > :not(#sp-age-gate) { visibility: hidden !important; }
    body.sp-age-locked { overflow: hidden; }
    #sp-age-gate {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      overflow: auto;
      padding: 22px;
      background: #f3b8d3;
      color: #252a67;
      font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif;
      visibility: visible !important;
    }
    #sp-age-gate * { box-sizing: border-box; }
    #sp-age-gate .sp-age-card {
      width: min(100%, 480px);
      padding: clamp(25px, 6vw, 45px);
      border: 1px solid #c18f9e;
      border-radius: 6px 6px 38px 6px;
      background: #fff5e9;
      box-shadow: 8px 9px 0 rgba(199, 119, 166, .35);
      text-align: center;
    }
    #sp-age-gate .sp-age-site {
      margin: 0 0 24px;
      font: italic bold 12px Georgia, serif;
      letter-spacing: .2em;
      color: #283bbc;
    }
    #sp-age-gate h2 {
      margin: 0 0 10px;
      font: bold clamp(21px, 5vw, 28px) Georgia, serif;
      letter-spacing: .08em;
      color: #283bbc;
    }
    #sp-age-gate .sp-age-subtitle { margin: 0 0 24px; font-weight: bold; }
    #sp-age-gate .sp-age-description { font-size: 14px; line-height: 1.9; }
    #sp-age-gate .sp-age-question { margin: 22px 0; font-weight: bold; }
    #sp-age-gate .sp-age-buttons { display: grid; gap: 12px; }
    #sp-age-gate button {
      width: 100%;
      padding: 13px 16px;
      border: 2px solid #283bbc;
      border-radius: 30px;
      background: #283bbc;
      color: white;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.5;
    }
    #sp-age-gate button.sp-age-no { background: transparent; color: #283bbc; }
    #sp-age-gate button:focus-visible { outline: 3px solid #d21b62; outline-offset: 3px; }
    #sp-age-gate .sp-age-note { margin: 20px 0 0; font-size: 11px; line-height: 1.7; }
  `;
  document.head.appendChild(style);

  function showAgeGate() {
    const main = document.querySelector('main');
    const previousAriaHidden = main?.getAttribute('aria-hidden');
    if (main) {
      main.inert = true;
      main.setAttribute('aria-hidden', 'true');
    }

    const gate = document.createElement('section');
    gate.id = 'sp-age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'sp-age-title');
    gate.setAttribute('aria-describedby', 'sp-age-description');
    gate.innerHTML = `
      <div class="sp-age-card">
        <p class="sp-age-site">SUGAR PLANET</p>
        <h2 id="sp-age-title">AGE VERIFICATION</h2>
        <p class="sp-age-subtitle">年齢確認</p>
        <p class="sp-age-description" id="sp-age-description">この先には成人向けの表現を含む小説があります。</p>
        <p class="sp-age-question">あなたは18歳以上ですか？</p>
        <div class="sp-age-buttons">
          <button type="button" id="sp-age-yes">YES — 18歳以上です</button>
          <button type="button" class="sp-age-no" id="sp-age-no">NO — 18歳未満です</button>
        </div>
        <p class="sp-age-note">確認後、同じブラウザでは30日間この画面を省略します。</p>
      </div>
    `;
    document.body.appendChild(gate);
    document.body.classList.add('sp-age-locked');

    const yesButton = gate.querySelector('#sp-age-yes');
    const noButton = gate.querySelector('#sp-age-no');
    yesButton.focus();

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
        main.inert = false;
        if (previousAriaHidden === null) main.removeAttribute('aria-hidden');
        else main.setAttribute('aria-hidden', previousAriaHidden);
      }
    });

    noButton.addEventListener('click', () => {
      // 小説は novels/ フォルダ内にあるため、ひとつ上がサイトHOMEです。
      window.location.replace('../');
    });

    // モーダル内からキーボード操作が逸れないようにします。
    gate.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const first = yesButton;
      const last = noButton;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAgeGate, { once: true });
  } else {
    showAgeGate();
  }
})();
