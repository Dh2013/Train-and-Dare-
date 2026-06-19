import { Button, message } from 'antd';
import {
  CopyOutlined,
  FacebookFilled,
  LinkedinFilled,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { trackEvent } from '../lib/analytics';

interface SocialShareButtonsProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

function getShareUrl(url?: string): string {
  if (url) {
    return url;
  }
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return 'https://trainanddare.com';
}

export default function SocialShareButtons({
  title,
  text,
  url,
  className,
}: SocialShareButtonsProps) {
  const shareUrl = getShareUrl(url);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text || title);

  const trackShare = (platform: string) => {
    trackEvent('share', {
      method: platform,
      content_type: 'website',
      item_id: title,
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackShare('copy_link');
      message.success('Lien copie.');
    } catch {
      message.error('Impossible de copier le lien.');
    }
  };

  return (
    <div className={`social-share-buttons ${className || ''}`}>
      <Button
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        icon={<WhatsAppOutlined />}
        onClick={() => trackShare('whatsapp')}
      >
        WhatsApp
      </Button>
      <Button
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        icon={<FacebookFilled />}
        onClick={() => trackShare('facebook')}
      >
        Facebook
      </Button>
      <Button
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        icon={<LinkedinFilled />}
        onClick={() => trackShare('linkedin')}
      >
        LinkedIn
      </Button>
      <Button icon={<CopyOutlined />} onClick={copyLink}>
        Copier
      </Button>
    </div>
  );
}
