export const ZOOM_SCHEDULER_URL = "https://scheduler.zoom.us/lucas-domingues/30-mins-with-lucas-safety-4-0-academy";

export const normaliseWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `44${digits.slice(1)}`;
  return digits;
};

export const getWhatsAppLeadMessage = (name: string, context?: string): string => {
  const firstName = name.split(' ')[0] || name;
  const opener = `Hi ${firstName}, this is Lucas from SafetyTech Academy.`;
  if (context) {
    return `${opener} ${context} Happy to answer any questions — would a quick 15-min call work?`;
  }
  return `${opener} Thanks for visiting — happy to help with any questions about the programme.`;
};

export const openWhatsAppBusiness = async (phone: string, message: string) => {
  const normalized = normaliseWhatsAppNumber(phone);
  const encodedMessage = encodeURIComponent(message);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;
  const isEmbedded = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const businessAppUrl = `whatsapp-business://send?phone=${normalized}&text=${encodedMessage}`;
  const universalWhatsAppUrl = `https://wa.me/${normalized}?text=${encodedMessage}`;
  const androidBusinessIntentUrl = `intent://send?phone=${normalized}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${encodeURIComponent(universalWhatsAppUrl)};end`;
  const webUrl = `https://web.whatsapp.com/send?phone=${normalized}&text=${encodedMessage}`;
  const copiedText = `+${normalized}\n${message}\n\nOpen in WhatsApp Business Web:\n${webUrl}`;

  const copyLeadDetails = async () => {
    try {
      await navigator.clipboard.writeText(copiedText);
      return true;
    } catch {
      return false;
    }
  };

  if (isEmbedded) {
    const copied = await copyLeadDetails();
    return {
      success: false,
      copied,
      message: copied
        ? 'Lead details copied. Open the published admin page in your phone browser to launch WhatsApp Business.'
        : 'Preview blocks WhatsApp. Open the published admin page in your phone browser.',
    };
  }

  if (isMobile) {
    void copyLeadDetails();
    window.location.href = isAndroid ? androidBusinessIntentUrl : businessAppUrl;
    return {
      success: true,
      copied: true,
      message: 'Opening WhatsApp Business…',
    };
  }

  const copied = await copyLeadDetails();
  const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
  return {
    success: !!win,
    copied,
    message: win
      ? 'WhatsApp link copied. Opening WhatsApp Business Web…'
      : copied
        ? 'Pop-up blocked — WhatsApp link copied. Paste it into a new browser tab.'
        : 'Pop-up blocked — please allow pop-ups to open WhatsApp Business Web.',
  };
};
