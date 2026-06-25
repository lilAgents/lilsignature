/* lilSignature - native lilAgents build.
 * Form fields -> Gmail-safe HTML signature -> live preview + copy.
 * 100% client-side; logic ported from the original signatureGenerator.
 */
(function () {
  const form = document.getElementById('sig-form');
  if (!form) return;

  const preview = document.getElementById('sig-preview');
  const previewBox = document.getElementById('sig-preview-box');
  const htmlArea = document.getElementById('sig-html');
  const tabPreview = document.getElementById('tab-preview');
  const tabHtml = document.getElementById('tab-html');
  const panePreview = document.getElementById('pane-preview');
  const paneHtml = document.getElementById('pane-html');
  const resetHtmlBtn = document.getElementById('reset-html');
  const copySigBtn = document.getElementById('copy-sig');
  const copyHtmlBtn = document.getElementById('copy-html');
  const darkToggle = document.getElementById('dark-toggle');

  let isCustomized = false;
  let darkPreview = false;

  /* ---------- helpers (ported from signatureGenerator.ts) ---------- */
  function ensureHttpPrefix(url) {
    if (url && !/^https?:\/\//i.test(url)) return 'https://' + url;
    return url;
  }
  function formatPhoneForTel(phone) { return phone ? phone.replace(/\D/g, '') : ''; }
  function addUtmParams(url, email) {
    if (!url) return url;
    const fullUrl = ensureHttpPrefix(url);
    const sep = fullUrl.includes('?') ? '&' : '?';
    let utm = 'utm_source=email&utm_medium=signature';
    if (email) utm += `&utm_campaign=${encodeURIComponent(email)}`;
    return `${fullUrl}${sep}${utm}`;
  }
  function socialIcon(href, img, alt) {
    return `<span style="display:inline-block;margin-right:4px;"><a href="${href}" target="_blank" style="text-decoration:none;"><img src="${img}" width="24" height="24" alt="${alt}" border="0" style="display:block;border:0;"></a></span>`;
  }

  function getFormData() {
    const v = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    return {
      fullName: v('fullName'), jobTitle: v('jobTitle'), companyName: v('companyName'),
      email: v('email'), workPhone: v('workPhone'), directPhone: v('directPhone'),
      website: v('website'), address: v('address'),
      youtube: v('youtube'), linkedin: v('linkedin'), twitter: v('twitter'),
      customSocial1: { imgUrl: v('cs1Img'), linkUrl: v('cs1Link') },
      customSocial2: { imgUrl: v('cs2Img'), linkUrl: v('cs2Link') },
      customSocial3: { imgUrl: v('cs3Img'), linkUrl: v('cs3Link') },
      topLeftImage: v('topLeftImage'), topLeftImageUrl: v('topLeftImageUrl'),
      bottomImage: v('bottomImage'), bottomImageUrl: v('bottomImageUrl'),
    };
  }

  function generateSignatureHtml(d) {
    const showWorkPhone = !!d.workPhone;
    const showDirectPhone = !!d.directPhone;
    const showEmail = !!d.email;
    const workPhoneDisplay = showWorkPhone && showDirectPhone ? `Work: ${d.workPhone}` : d.workPhone;
    const directPhoneDisplay = showWorkPhone && showDirectPhone ? `Direct: ${d.directPhone}` : d.directPhone;
    const websiteDisplay = d.website ? d.website.replace(/^https?:\/\//i, '') : '';

    const showYoutube = !!d.youtube, showLinkedin = !!d.linkedin, showTwitter = !!d.twitter;
    const showCS1 = !!(d.customSocial1.imgUrl && d.customSocial1.linkUrl);
    const showCS2 = !!(d.customSocial2.imgUrl && d.customSocial2.linkUrl);
    const showCS3 = !!(d.customSocial3.imgUrl && d.customSocial3.linkUrl);
    const showJobCompany = !!(d.jobTitle || d.companyName);
    const showContactInfo = !!(showWorkPhone || showDirectPhone || d.website);
    const showSocialIcons = !!(showYoutube || showLinkedin || showTwitter || showCS1 || showCS2 || showCS3);

    let bottomImageHtml = '';
    if (d.bottomImage) {
      if (d.bottomImageUrl) {
        bottomImageHtml = `<tr><td colspan="2" style="padding-top: 10px;"><a href="${addUtmParams(d.bottomImageUrl, d.email)}" target="_blank" style="text-decoration: none; border: none;"><img src="${d.bottomImage}" alt="Banner" style="max-height: 50px; width: auto; max-width: 100%; border: none;"></a></td></tr>`;
      } else {
        bottomImageHtml = `<tr><td colspan="2" style="padding-top: 10px;"><img src="${d.bottomImage}" alt="Banner" style="max-height: 50px; width: auto; max-width: 100%;"></td></tr>`;
      }
    }

    let textContent = `<span style="display:block;font-size:16px;font-weight:bold;color:#000000;line-height:20px;margin:0;">${d.fullName || 'Your Name'}</span>`;
    if (showJobCompany) {
      textContent += `<span style="display:block;font-size:12px;color:#666666;line-height:18px;margin:0;">${d.jobTitle || ''}${d.jobTitle && d.companyName ? ', ' : ''}${d.companyName || ''}</span>`;
    }
    if (showEmail) {
      textContent += `<span style="display:block;font-size:12px;line-height:18px;margin:4px 0 0 0;"><a href="mailto:${d.email}" style="color:#666666;text-decoration:none;">${d.email}</a></span>`;
    }
    if (showContactInfo) {
      let c = '';
      if (showWorkPhone) c += `<span style="display:inline;"><a href="tel:${formatPhoneForTel(d.workPhone)}" style="color:#666666;text-decoration:none;">${workPhoneDisplay}</a></span>`;
      if (showWorkPhone && (showDirectPhone || d.website)) c += ' | ';
      if (showDirectPhone) c += `<span style="display:inline;"><a href="tel:${formatPhoneForTel(d.directPhone)}" style="color:#666666;text-decoration:none;">${directPhoneDisplay}</a></span>`;
      if ((showDirectPhone || showWorkPhone) && d.website) c += ' | ';
      if (d.website) c += `<span style="display:inline;"><a href="${addUtmParams(d.website, d.email)}" target="_blank" style="color:#666666;text-decoration:none;">${websiteDisplay}</a></span>`;
      textContent += `<span style="display:block;font-size:12px;color:#666666;line-height:18px;margin:0;">${c}</span>`;
    }
    if (d.address) {
      textContent += `<span style="display:block;font-size:12px;color:#666666;line-height:18px;margin:0;">${d.address}</span>`;
    }
    if (showSocialIcons) {
      let s = '';
      if (showYoutube) s += socialIcon(ensureHttpPrefix(d.youtube), 'https://lilagents.com/assets/tools/signature/youtube.png', 'YouTube');
      if (showLinkedin) s += socialIcon(ensureHttpPrefix(d.linkedin), 'https://lilagents.com/assets/tools/signature/linkedin.png', 'LinkedIn');
      if (showTwitter) s += socialIcon(ensureHttpPrefix(d.twitter), 'https://lilagents.com/assets/tools/signature/x.png', 'X');
      if (showCS1) s += socialIcon(ensureHttpPrefix(d.customSocial1.linkUrl), d.customSocial1.imgUrl, 'Custom');
      if (showCS2) s += socialIcon(ensureHttpPrefix(d.customSocial2.linkUrl), d.customSocial2.imgUrl, 'Custom');
      if (showCS3) s += socialIcon(ensureHttpPrefix(d.customSocial3.linkUrl), d.customSocial3.imgUrl, 'Custom');
      textContent += `<span style="display:block;margin:6px 0 0 0;line-height:0;">${s}</span>`;
    }

    const topLeftUrl = addUtmParams(d.topLeftImageUrl || 'https://lilagents.com', d.email);
    return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;font-family:Arial,sans-serif;font-size:14px;line-height:1.4;"><tr><td width="65" valign="top" style="width:65px;vertical-align:top;"><a href="${topLeftUrl}" target="_blank" style="text-decoration:none;display:block;"><img src="${d.topLeftImage}" width="65" height="65" alt="Logo" border="0" style="display:block;border:0;width:65px;height:65px;"></a></td><td width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td valign="top" style="vertical-align:top;font-family:Arial,sans-serif;">${textContent}</td></tr>${bottomImageHtml}</table>`;
  }

  /* ---------- render ---------- */
  function currentHtml() {
    return isCustomized ? htmlArea.value : generateSignatureHtml(getFormData());
  }
  function render() {
    const html = currentHtml();
    preview.innerHTML = html;
    if (!isCustomized) htmlArea.value = html;
  }

  form.addEventListener('input', () => { if (!isCustomized) render(); });

  htmlArea.addEventListener('input', () => {
    isCustomized = true;
    resetHtmlBtn.classList.remove('hidden');
    preview.innerHTML = htmlArea.value;
  });
  resetHtmlBtn.addEventListener('click', () => {
    isCustomized = false;
    resetHtmlBtn.classList.add('hidden');
    render();
  });

  /* ---------- tabs ---------- */
  function setTab(which) {
    const isPrev = which === 'preview';
    panePreview.classList.toggle('hidden', !isPrev);
    paneHtml.classList.toggle('hidden', isPrev);
    tabPreview.classList.toggle('tab-on', isPrev);
    tabHtml.classList.toggle('tab-on', !isPrev);
  }
  tabPreview.addEventListener('click', () => setTab('preview'));
  tabHtml.addEventListener('click', () => setTab('html'));

  /* ---------- dark-background preview toggle ---------- */
  darkToggle.addEventListener('click', () => {
    darkPreview = !darkPreview;
    previewBox.style.backgroundColor = darkPreview ? '#222222' : '#ffffff';
    previewBox.classList.toggle('sig-dark', darkPreview);
    darkToggle.textContent = darkPreview ? 'Light background' : 'Dark background';
  });

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(message) {
    let el = document.getElementById('sig-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sig-toast';
      el.className = 'sig-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- copy ---------- */
  copySigBtn.addEventListener('click', () => {
    const html = currentHtml();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(temp);
    sel.removeAllRanges();
    sel.addRange(range);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    sel.removeAllRanges();
    document.body.removeChild(temp);
    toast(ok ? 'Signature copied' : 'Copy failed');
  });
  copyHtmlBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(currentHtml()); toast('HTML copied'); }
    catch { toast('Copy failed'); }
  });

  render();
})();
