import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const LOGO_URL =
  'https://static.wixstatic.com/media/c70f3b_d84fe744da624e75947b8c0f9b1cf989~mv2.png/v1/fill/w_574,h_383,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Updated_Monochrome_on_transparent.png';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="Jubilé">
      <Image
        src={LOGO_URL}
        alt="Jubilé"
        width={120}
        height={80}
        priority
        className="h-12 w-auto object-contain"
      />
    </Link>
  );
}
